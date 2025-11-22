const express = require('express');
const { signup, login, refreshToken, logout } = require('../controllers/authController');
const { signupValidator, loginValidator, validate } = require('../validators/validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @access  Public
 * @desc    Create a new user account
 */
router.post('/signup', authLimiter, signupValidator, validate, signup);

/**
 * @route   POST /api/auth/login
 * @access  Public
 * @desc    Login user and get tokens
 */
router.post('/login', authLimiter, loginValidator, validate, login);

/**
 * @route   POST /api/auth/refresh-token
 * @access  Public
 * @desc    Refresh access token
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @access  Private
 * @desc    Logout user
 */
router.post('/logout', logout);

module.exports = router;
