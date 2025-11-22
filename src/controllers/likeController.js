const Post = require('../models/Post');
const Like = require('../models/Like');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { ACTIVITY_TYPES, USER_ROLES } = require('../config/constants');
const { invalidatePattern } = require('../utils/cache');

exports.likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.isDeleted) {
      return res.status(404).json({ message: 'Post has been deleted' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ user: userId, post: postId, isDeleted: false });
    if (existingLike) {
      return res.status(409).json({ message: 'You have already liked this post' });
    }

    // Create like
    const like = new Like({ user: userId, post: postId });
    await like.save();

    // Add to post likes
    post.likes.push(userId);
    post.likesCount = post.likes.length;
    await post.save();

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.POST_LIKED,
      target: postId,
      targetUser: post.author,
      description: `${(await User.findById(userId)).username} liked a post`,
    });

    await invalidatePattern('feed:*');

    res.status(201).json({
      message: 'Post liked successfully',
      like,
    });
  } catch (error) {
    next(error);
  }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const like = await Like.findOne({ user: userId, post: postId, isDeleted: false });
    if (!like) {
      return res.status(404).json({ message: 'You have not liked this post' });
    }

    // Mark like as deleted
    like.isDeleted = true;
    like.deletedBy = userId;
    await like.save();

    // Remove from post likes
    const post = await Post.findById(postId);
    if (post) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likesCount = post.likes.length;
      await post.save();
    }

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.POST_UNLIKED,
      target: postId,
      description: `${req.user.username} unliked a post`,
    });

    await invalidatePattern('feed:*');

    res.status(200).json({
      message: 'Post unliked successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likes = await Like.find({ post: postId, isDeleted: false })
      .populate('user', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Like.countDocuments({ post: postId, isDeleted: false });

    res.status(200).json({
      message: 'Post likes retrieved successfully',
      likes,
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

exports.deleteLike = async (req, res, next) => {
  try {
    const { likeId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const like = await Like.findById(likeId);
    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    // Check authorization
    const isOwner = like.user.toString() === userId;
    const isAdmin = userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.OWNER;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this like' });
    }

    like.isDeleted = true;
    like.deletedBy = userId;
    like.deletedReason = isAdmin ? `Deleted by ${userRole}` : 'Deleted by user';
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
