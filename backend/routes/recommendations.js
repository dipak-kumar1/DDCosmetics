const express = require('express');
const router = express.Router();
const { trackActivity, getPersonalized, getProductRecommendations } = require('../controllers/recommendationController');
const optionalAuth = require('../middleware/optionalAuth');

router.post('/track', optionalAuth, trackActivity);
router.get('/personalized', optionalAuth, getPersonalized);
router.get('/product/:id', optionalAuth, getProductRecommendations);

module.exports = router;
