const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/weather', require('./weather'));

// Public recent searches
router.get('/searches', require('../controllers/searchController').recentPublic);

// Protected: user's searches
const requireAuth = require('../middleware/requireAuth');
const searchController = require('../controllers/searchController');
router.get('/my-searches', requireAuth, searchController.listForUser);

module.exports = router;
