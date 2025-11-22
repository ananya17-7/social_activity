const User = require('../models/User');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Activity = require('../models/Activity');
const { ACTIVITY_TYPES, USER_ROLES } = require('../config/constants');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { deleteCache, invalidatePattern } = require('../utils/cache');

exports.getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture')
      .select('-refreshTokens');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userObj = user.toObject();
    userObj.followersCount = user.followers.length;
    userObj.followingCount = user.following.length;
    userObj.postsCount = await Post.countDocuments({ author: user._id, isDeleted: false });

    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture')
      .select('-refreshTokens');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userObj = user.toObject();
    userObj.followersCount = user.followers.length;
    userObj.followingCount = user.following.length;
    userObj.postsCount = await Post.countDocuments({ author: user._id, isDeleted: false });

    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio } = req.body;
    const userId = req.userId;
    let profilePicture = null;

    // Upload profile picture if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'social-feed/profiles');
      profilePicture = result.secure_url;
    }

    const updateData = { firstName, lastName, bio };
    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select(
      '-refreshTokens'
    );

    await invalidatePattern('user:profile:*');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (user.following.includes(targetUserId)) {
      return res.status(409).json({ message: 'You are already following this user' });
    }

    // Add to following list
    user.following.push(targetUserId);
    await user.save();

    // Add to followers list
    targetUser.followers.push(userId);
    await targetUser.save();

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.USER_FOLLOWED,
      targetUser: targetUserId,
      description: `${user.username} followed ${targetUser.username}`,
    });

    await invalidatePattern('user:*');

    res.status(200).json({
      message: 'User followed successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if following
    if (!user.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove from following list
    user.following = user.following.filter((id) => id.toString() !== targetUserId);
    await user.save();

    // Remove from followers list
    targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);
    await targetUser.save();

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.USER_UNFOLLOWED,
      targetUser: targetUserId,
      description: `${user.username} unfollowed ${targetUser.username}`,
    });

    await invalidatePattern('user:*');

    res.status(200).json({
      message: 'User unfollowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already blocked
    if (user.blockedUsers.includes(targetUserId)) {
      return res.status(409).json({ message: 'You have already blocked this user' });
    }

    // Add to blocked list
    user.blockedUsers.push(targetUserId);
    await user.save();

    // Add to blockedBy list
    targetUser.blockedBy.push(userId);
    await targetUser.save();

    // Unfollow if following
    if (user.following.includes(targetUserId)) {
      user.following = user.following.filter((id) => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);
      await user.save();
      await targetUser.save();
    }

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.USER_BLOCKED,
      targetUser: targetUserId,
      description: `${user.username} blocked ${targetUser.username}`,
    });

    await invalidatePattern('user:*');
    await invalidatePattern('feed:*');

    res.status(200).json({
      message: 'User blocked successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if blocked
    if (!user.blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ message: 'You have not blocked this user' });
    }

    // Remove from blocked list
    user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== targetUserId);
    await user.save();

    // Remove from blockedBy list
    targetUser.blockedBy = targetUser.blockedBy.filter((id) => id.toString() !== userId);
    await targetUser.save();

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.USER_UNBLOCKED,
      targetUser: targetUserId,
      description: `${user.username} unblocked ${targetUser.username}`,
    });

    await invalidatePattern('user:*');
    await invalidatePattern('feed:*');

    res.status(200).json({
      message: 'User unblocked successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username }).populate(
      'followers',
      'username firstName lastName profilePicture'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const paginatedFollowers = user.followers.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      message: 'Followers retrieved successfully',
      followers: paginatedFollowers,
      pagination: {
        total: user.followers.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(user.followers.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username }).populate(
      'following',
      'username firstName lastName profilePicture'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const paginatedFollowing = user.following.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      message: 'Following list retrieved successfully',
      following: paginatedFollowing,
      pagination: {
        total: user.following.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(user.following.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
