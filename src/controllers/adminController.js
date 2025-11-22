const User = require('../models/User');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Activity = require('../models/Activity');
const { USER_ROLES, ACTIVITY_TYPES } = require('../config/constants');
const { invalidatePattern } = require('../utils/cache');

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set user as inactive instead of hard delete
    user.isActive = false;
    await user.save();

    // Soft delete all user's posts
    await Post.updateMany({ author: targetUserId }, { isDeleted: true, deletedBy: userId });

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.USER_DELETED,
      targetUser: targetUserId,
      description: `${(await User.findById(userId)).username} deleted user ${user.username}`,
      metadata: { reason },
    });

    await invalidatePattern('user:*');
    await invalidatePattern('feed:*');

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteLike = async (req, res, next) => {
  try {
    const { likeId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    const like = await Like.findById(likeId);
    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    like.isDeleted = true;
    like.deletedBy = userId;
    like.deletedReason = reason || 'Deleted by admin';
    await like.save();

    // Update post likes count
    const post = await Post.findById(like.post);
    if (post) {
      post.likes = post.likes.filter((id) => id.toString() !== like.user.toString());
      post.likesCount = post.likes.length;
      await post.save();
    }

    await invalidatePattern('feed:*');

    res.status(200).json({
      message: 'Like deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isDeleted = true;
    post.deletedBy = userId;
    post.deletedReason = reason || 'Deleted by admin';
    await post.save();

    // Remove all likes
    await Like.updateMany({ post: postId }, { isDeleted: true, deletedBy: userId });

    await invalidatePattern('feed:*');

    res.status(200).json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.promoteToAdmin = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== USER_ROLES.OWNER) {
      return res.status(403).json({ message: 'Only owners can promote users to admin' });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.OWNER) {
      return res.status(409).json({ message: 'User is already an admin or owner' });
    }

    user.role = USER_ROLES.ADMIN;
    await user.save();

    res.status(200).json({
      message: 'User promoted to admin successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

exports.demoteFromAdmin = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== USER_ROLES.OWNER) {
      return res.status(403).json({ message: 'Only owners can demote admins' });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === USER_ROLES.OWNER) {
      return res.status(409).json({ message: 'Cannot demote an owner' });
    }

    if (user.role !== USER_ROLES.ADMIN) {
      return res.status(409).json({ message: 'User is not an admin' });
    }

    user.role = USER_ROLES.USER;
    await user.save();

    res.status(200).json({
      message: 'User demoted from admin successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      message: 'Users retrieved successfully',
      users: users.map((u) => u.toJSON()),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isDeleted } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'true';

    const posts = await Post.find(filter)
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      message: 'Posts retrieved successfully',
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalPosts = await Post.countDocuments({ isDeleted: false });
    const deletedPosts = await Post.countDocuments({ isDeleted: true });
    const totalLikes = await Like.countDocuments({ isDeleted: false });
    const totalActivities = await Activity.countDocuments();
    const adminCount = await User.countDocuments({ role: USER_ROLES.ADMIN });
    const ownerCount = await User.countDocuments({ role: USER_ROLES.OWNER });

    res.status(200).json({
      message: 'System statistics retrieved successfully',
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalPosts,
        deletedPosts,
        totalLikes,
        totalActivities,
        adminCount,
        ownerCount,
        regularUsersCount: totalUsers - adminCount - ownerCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
