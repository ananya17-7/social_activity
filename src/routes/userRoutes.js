const express = require('express');
const {
  getUserProfile,
  getMyProfile,
  updateProfile,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  getFollowers,
  getFollowing,
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const {
  updateProfileValidator,
  objectIdValidator,
  paginationValidator,
  validate,
} = require('../validators/validators');
const upload = require('../utils/upload');

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @access  Private
 * @desc    Get current user profile
 */
router.get('/me', auth, getMyProfile);

/**
 * @route   PUT /api/users/profile
 * @access  Private
 * @desc    Update user profile
 */
router.put(
  '/profile',
  auth,
  upload.single('profilePicture'),
  updateProfileValidator,
  validate,
  updateProfile
);

/**
 * @route   GET /api/users/:username
 * @access  Private
 * @desc    Get user profile by username
 */
router.get('/:username', auth, getUserProfile);

/**
 * @route   POST /api/users/:userId/follow
 * @access  Private
 * @desc    Follow a user
 */
router.post('/:userId/follow', auth, objectIdValidator, validate, followUser);

/**
 * @route   DELETE /api/users/:userId/follow
 * @access  Private
 * @desc    Unfollow a user
 */
router.delete('/:userId/follow', auth, objectIdValidator, validate, unfollowUser);

/**
 * @route   POST /api/users/:userId/block
 * @access  Private
 * @desc    Block a user
 */
router.post('/:userId/block', auth, objectIdValidator, validate, blockUser);

/**
 * @route   DELETE /api/users/:userId/block
 * @access  Private
 * @desc    Unblock a user
 */
router.delete('/:userId/block', auth, objectIdValidator, validate, unblockUser);

/**
 * @route   GET /api/users/:username/followers
 * @access  Private
 * @desc    Get user followers
 */
router.get('/:username/followers', auth, paginationValidator, validate, getFollowers);

/**
 * @route   GET /api/users/:username/following
 * @access  Private
 * @desc    Get user following list
 */
router.get('/:username/following', auth, paginationValidator, validate, getFollowing);

module.exports = router;
