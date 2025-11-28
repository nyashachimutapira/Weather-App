const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const optionalAuth = require('../middleware/auth');

// Attach optional auth, then handle current weather
router.get('/current', optionalAuth, weatherController.current);

module.exports = router;
