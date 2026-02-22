const express = require('express');
const router = express.Router();
const { predictAndReorder, getReorderPredictions } = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/predict-reorder', protect, admin, predictAndReorder);
router.get('/reorder-predictions', protect, admin, getReorderPredictions);

module.exports = router;
