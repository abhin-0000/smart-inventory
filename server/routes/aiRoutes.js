const express = require('express');
const router = express.Router();
const { predictAndReorder } = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/predict-reorder', protect, admin, predictAndReorder);

module.exports = router;
