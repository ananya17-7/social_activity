const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getUserPosts,
} = require('../controllers/postController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  createPostValidator,
  updatePostValidator,
  paginationValidator,
  validate,
  objectIdValidator,
} = require('../validators/validators');
const upload = require('../utils/upload');

const router = express.Router();

/**
 * @route   POST /api/posts
 * @access  Private
 * @desc    Create a new post
 */
router.post(
  '/',
  auth,
  upload.single('image'),
  createPostValidator,
  validate,
  createPost
);

/**
 * @route   GET /api/posts
 * @access  Private
 * @desc    Get all posts (feed)
 */
router.get('/', auth, paginationValidator, validate, getPosts);

/**
 * @route   GET /api/posts/:id
 * @access  Private
 * @desc    Get post by ID
 */
router.get('/:id', auth, objectIdValidator, validate, getPostById);

/**
 * @route   PUT /api/posts/:id
 * @access  Private
 * @desc    Update a post
 */
router.put(
  '/:id',
  auth,
  objectIdValidator,
  updatePostValidator,
  validate,
  updatePost
);

/**
 * @route   DELETE /api/posts/:id
 * @access  Private
 * @desc    Delete a post
 */
router.delete('/:id', auth, objectIdValidator, validate, deletePost);

/**
 * @route   GET /api/posts/user/:username
 * @access  Private
 * @desc    Get posts by username
 */
router.get('/user/:username', auth, paginationValidator, validate, getUserPosts);

module.exports = router;
