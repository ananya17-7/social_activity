const express = require('express');
const {
  getActivityFeed,
  getPublicActivityFeed,
  getUserActivityFeed,
  getActivityDetails,
} = require('../controllers/activityController');
const auth = require('../middleware/auth');
const { paginationValidator, objectIdValidator, validate } = require('../validators/validators');

const router = express.Router();

/**
 * @route   GET /api/activities/feed
 * @access  Private
 * @desc    Get personalized activity feed
 */
router.get('/feed', auth, paginationValidator, validate, getActivityFeed);

/**
 * @route   GET /api/activities/feed/public
 * @access  Private
 * @desc    Get public activity feed
 */
router.get('/feed/public', auth, paginationValidator, validate, getPublicActivityFeed);

/**
 * @route   GET /api/activities/:username
 * @access  Private
 * @desc    Get user's activity feed
 */
router.get('/:username', auth, paginationValidator, validate, getUserActivityFeed);

/**
 * @route   GET /api/activities/details/:activityId
 * @access  Private
 * @desc    Get activity details
 */
router.get(
  '/details/:activityId',
  auth,
  objectIdValidator,
  validate,
  getActivityDetails
);

module.exports = router;
