const express = require('express');
const { createFeedback, getFeedbacks } = require('../controllers/feedbackController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/', verifyToken, createFeedback);
router.get('/', verifyToken, getFeedbacks);

module.exports = router;
