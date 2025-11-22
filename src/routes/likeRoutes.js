const express = require('express');
const {
  likePost,
  unlikePost,
  getPostLikes,
  deleteLike,
} = require('../controllers/likeController');
const auth = require('../middleware/auth');
const { authorize, requireRole } = require('../middleware/authorize');
const { objectIdValidator, paginationValidator, validate } = require('../validators/validators');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

/**
 * @route   POST /api/likes/:postId
 * @access  Private
 * @desc    Like a post
 */
router.post('/:postId', auth, objectIdValidator, validate, likePost);

/**
 * @route   DELETE /api/likes/:postId
 * @access  Private
 * @desc    Unlike a post
 */
router.delete('/:postId', auth, objectIdValidator, validate, unlikePost);

/**
 * @route   GET /api/likes/:postId
 * @access  Private
 * @desc    Get all likes for a post
 */
router.get('/:postId', auth, objectIdValidator, paginationValidator, validate, getPostLikes);

/**
 * @route   DELETE /api/likes/delete/:likeId
 * @access  Private (Admin/Owner only)
 * @desc    Delete a like (admin/owner only)
 */
router.delete(
  '/delete/:likeId',
  auth,
  requireRole([USER_ROLES.ADMIN, USER_ROLES.OWNER]),
  objectIdValidator,
  validate,
  deleteLike
);

module.exports = router;
