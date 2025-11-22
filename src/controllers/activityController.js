const Activity = require('../models/Activity');
const User = require('../models/User');
const Post = require('../models/Post');
const { getCache, setCache, invalidatePattern } = require('../utils/cache');
const { CACHE_KEYS } = require('../config/constants');

exports.getActivityFeed = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get user's blocking information
    const user = await User.findById(userId).select('blockedUsers blockedBy following');
    const blockedUserIds = [...user.blockedUsers, ...user.blockedBy];

    // Get activities from users being followed + self activities
    const followingIds = user.following;
    const actorIds = [userId, ...followingIds];

    const activities = await Activity.find({
      actor: { $in: actorIds },
      actor: { $nin: blockedUserIds },
    })
      .populate('actor', 'username firstName lastName profilePicture')
      .populate('target')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out activities where the target post is from a blocked user
    const filteredActivities = await Promise.all(
      activities.map(async (activity) => {
        if (activity.target && activity.target.author) {
          const isPostAuthorBlocked = blockedUserIds.some(
            (id) => id.toString() === activity.target.author.toString()
          );
          if (isPostAuthorBlocked) return null;
        }
        return activity;
      })
    );

    const validActivities = filteredActivities.filter((a) => a !== null);

    const total = await Activity.countDocuments({
      actor: { $in: actorIds },
    });

    res.status(200).json({
      message: 'Activity feed retrieved successfully',
      activities: validActivities,
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

exports.getPublicActivityFeed = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get user's blocking information
    const user = await User.findById(userId).select('blockedUsers blockedBy');
    const blockedUserIds = [...user.blockedUsers, ...user.blockedBy];

    // Get all activities except from blocked users
    const activities = await Activity.find({
      actor: { $nin: blockedUserIds },
    })
      .populate('actor', 'username firstName lastName profilePicture')
      .populate('target')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out activities where the target post is from a blocked user
    const filteredActivities = await Promise.all(
      activities.map(async (activity) => {
        if (activity.target && activity.target.author) {
          const isPostAuthorBlocked = blockedUserIds.some(
            (id) => id.toString() === activity.target.author.toString()
          );
          if (isPostAuthorBlocked) return null;
        }
        return activity;
      })
    );

    const validActivities = filteredActivities.filter((a) => a !== null);

    const total = await Activity.countDocuments({
      actor: { $nin: blockedUserIds },
    });

    res.status(200).json({
      message: 'Public activity feed retrieved successfully',
      activities: validActivities,
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

exports.getUserActivityFeed = async (req, res, next) => {
  try {
    const { username } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Find target user
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if blocked
    const currentUser = await User.findById(userId);
    const isBlocked =
      currentUser.blockedUsers.includes(targetUser._id) ||
      currentUser.blockedBy.includes(targetUser._id);

    if (isBlocked) {
      return res.status(403).json({ message: 'Cannot view activities from this user' });
    }

    const activities = await Activity.find({ actor: targetUser._id })
      .populate('actor', 'username firstName lastName profilePicture')
      .populate('target')
      .populate('targetUser', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ actor: targetUser._id });

    res.status(200).json({
      message: 'User activity feed retrieved successfully',
      activities,
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

exports.getActivityDetails = async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findById(activityId)
      .populate('actor', 'username firstName lastName profilePicture')
      .populate('target')
      .populate('targetUser', 'username firstName lastName profilePicture');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.status(200).json({
      message: 'Activity details retrieved successfully',
      activity,
    });
  } catch (error) {
    next(error);
  }
};
