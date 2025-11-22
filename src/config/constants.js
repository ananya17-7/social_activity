// User Roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  OWNER: 'owner',
};

// Activity Types
const ACTIVITY_TYPES = {
  POST_CREATED: 'post_created',
  POST_DELETED: 'post_deleted',
  USER_FOLLOWED: 'user_followed',
  USER_UNFOLLOWED: 'user_unfollowed',
  POST_LIKED: 'post_liked',
  POST_UNLIKED: 'post_unliked',
  USER_BLOCKED: 'user_blocked',
  USER_UNBLOCKED: 'user_unblocked',
  USER_DELETED: 'user_deleted',
};

// Permissions
const PERMISSIONS = {
  [USER_ROLES.USER]: {
    canCreatePost: true,
    canDeleteOwnPost: true,
    canDeleteOthersPost: false,
    canLikePost: true,
    canFollow: true,
    canBlock: true,
    canDeleteUser: false,
    canDeleteOthersPost: false,
    canManageAdmins: false,
  },
  [USER_ROLES.ADMIN]: {
    canCreatePost: true,
    canDeleteOwnPost: true,
    canDeleteOthersPost: true,
    canLikePost: true,
    canFollow: true,
    canBlock: true,
    canDeleteUser: true,
    canDeleteLikes: true,
    canManageAdmins: false,
  },
  [USER_ROLES.OWNER]: {
    canCreatePost: true,
    canDeleteOwnPost: true,
    canDeleteOthersPost: true,
    canLikePost: true,
    canFollow: true,
    canBlock: true,
    canDeleteUser: true,
    canDeleteLikes: true,
    canManageAdmins: true,
  },
};

// Cache Keys
const CACHE_KEYS = {
  FEED: 'feed:',
  USER_PROFILE: 'user:profile:',
  USER_FOLLOWERS: 'user:followers:',
  USER_FOLLOWING: 'user:following:',
  USER_BLOCKED: 'user:blocked:',
  POST: 'post:',
  ACTIVITY: 'activity:',
};

// Pagination
const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  USER_ROLES,
  ACTIVITY_TYPES,
  PERMISSIONS,
  CACHE_KEYS,
  DEFAULT_PAGINATION,
};
