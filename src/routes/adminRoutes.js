const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const {
  deleteUser,
  deleteLike,
  deletePost,
  promoteToAdmin,
  demoteFromAdmin,
  getAllUsers,
  getAllPosts,
  getSystemStats,
} = require('../controllers/adminController');
const { USER_ROLES } = require('../config/constants');
const { objectIdValidator, paginationValidator, validate } = require('../validators/validators');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth, requireRole([USER_ROLES.ADMIN, USER_ROLES.OWNER]));

/**
 * @route   DELETE /api/admin/users/:userId
 * @access  Private (Admin/Owner only)
 * @desc    Delete a user account
 */
router.delete('/users/:userId', objectIdValidator, validate, deleteUser);

/**
 * @route   DELETE /api/admin/posts/:postId
 * @access  Private (Admin/Owner only)
 * @desc    Delete a post
 */
router.delete('/posts/:postId', objectIdValidator, validate, deletePost);

/**
 * @route   DELETE /api/admin/likes/:likeId
 * @access  Private (Admin/Owner only)
 * @desc    Delete a like
 */
router.delete('/likes/:likeId', objectIdValidator, validate, deleteLike);

/**
 * @route   PUT /api/admin/users/:userId/promote
 * @access  Private (Owner only)
 * @desc    Promote user to admin
 */
router.put('/users/:userId/promote', objectIdValidator, validate, promoteToAdmin);

/**
 * @route   PUT /api/admin/users/:userId/demote
 * @access  Private (Owner only)
 * @desc    Demote admin to user
 */
router.put('/users/:userId/demote', objectIdValidator, validate, demoteFromAdmin);

/**
 * @route   GET /api/admin/users
 * @access  Private (Admin/Owner only)
 * @desc    Get all users
 */
router.get('/users', paginationValidator, validate, getAllUsers);

/**
 * @route   GET /api/admin/posts
 * @access  Private (Admin/Owner only)
 * @desc    Get all posts
 */
router.get('/posts', paginationValidator, validate, getAllPosts);

/**
 * @route   GET /api/admin/stats
 * @access  Private (Admin/Owner only)
 * @desc    Get system statistics
 */
router.get('/stats', getSystemStats);

module.exports = router;
