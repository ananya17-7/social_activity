const Post = require('../models/Post');
const Like = require('../models/Like');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { ACTIVITY_TYPES, USER_ROLES } = require('../config/constants');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { deleteCache, invalidatePattern } = require('../utils/cache');

exports.createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.userId;
    let imageUrl = null;

    // Upload image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'social-feed/posts');
      imageUrl = result.secure_url;
    }

    const post = new Post({
      author: userId,
      content,
      image: imageUrl,
    });

    await post.save();
    await post.populate('author', 'username firstName lastName profilePicture');

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.POST_CREATED,
      target: post._id,
      description: `${req.user.username} made a post`,
    });

    // Invalidate feed cache
    await invalidatePattern('feed:*');

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.userId;
    const skip = (page - 1) * limit;

    // Get user's blocked and blocked by lists
    const user = await User.findById(userId).select('blockedUsers blockedBy');
    const blockedUserIds = [
      ...user.blockedUsers,
      ...user.blockedBy,
    ];

    // Get posts excluding deleted ones and posts from blocked users
    const posts = await Post.find({
      isDeleted: false,
      author: { $nin: blockedUserIds },
    })
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add likes count and check if current user liked
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();
        postObj.isLikedByMe = post.likes.includes(userId);
        postObj.likesCount = post.likes.length;
        return postObj;
      })
    );

    const total = await Post.countDocuments({
      isDeleted: false,
      author: { $nin: blockedUserIds },
    });

    res.status(200).json({
      message: 'Posts retrieved successfully',
      posts: enrichedPosts,
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

exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await Post.findById(id).populate(
      'author',
      'username firstName lastName profilePicture'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is blocked
    const isBlocked = await User.findOne({
      $and: [
        { $or: [{ blockedUsers: userId }, { blockedBy: userId }] },
        { _id: post.author._id },
      ],
    });

    if (isBlocked) {
      return res.status(403).json({ message: 'You are blocked by this user' });
    }

    if (post.isDeleted) {
      return res.status(404).json({ message: 'Post has been deleted' });
    }

    const postObj = post.toObject();
    postObj.isLikedByMe = post.likes.includes(userId);
    postObj.likesCount = post.likes.length;

    res.status(200).json({
      message: 'Post retrieved successfully',
      post: postObj,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check authorization
    if (post.author.toString() !== userId && req.userRole !== USER_ROLES.ADMIN && req.userRole !== USER_ROLES.OWNER) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    if (content) post.content = content;

    await post.save();
    await post.populate('author', 'username firstName lastName profilePicture');

    await invalidatePattern('feed:*');

    res.status(200).json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check authorization
    const isAuthor = post.author.toString() === userId;
    const isAdmin = userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.OWNER;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.isDeleted = true;
    post.deletedBy = userId;
    post.deletedReason = isAuthor ? 'Deleted by author' : `Deleted by ${userRole}`;
    await post.save();

    // Create activity log
    await Activity.create({
      actor: userId,
      type: ACTIVITY_TYPES.POST_DELETED,
      target: post._id,
      description: `${req.user.username} deleted a post`,
    });

    // Remove all likes associated with this post
    await Like.updateMany({ post: id }, { isDeleted: true, deletedBy: userId });

    await invalidatePattern('feed:*');

    res.status(200).json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.userId;
    const skip = (page - 1) * limit;

    // Find user by username
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if blocked
    const isBlocked = await User.findOne({
      $or: [
        { _id: userId, blockedUsers: targetUser._id },
        { _id: userId, blockedBy: targetUser._id },
      ],
    });

    if (isBlocked) {
      return res.status(403).json({ message: 'Cannot view posts from this user' });
    }

    const posts = await Post.find({
      author: targetUser._id,
      isDeleted: false,
    })
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();
        postObj.isLikedByMe = post.likes.includes(userId);
        postObj.likesCount = post.likes.length;
        return postObj;
      })
    );

    const total = await Post.countDocuments({
      author: targetUser._id,
      isDeleted: false,
    });

    res.status(200).json({
      message: 'User posts retrieved successfully',
      posts: enrichedPosts,
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
