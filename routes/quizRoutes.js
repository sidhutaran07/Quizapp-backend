// routes/quizRoutes.js
const express = require('express');
const { getQuizzes, getQuizById, submitQuiz, getUserQuizzes, getUserHistory } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getQuizzes); // Public route
router.get('/categories', getQuizzes); // Public route (will get all quizzes and group by category)
router.get('/:id', getQuizById); // Public route

// Protected routes
router.post('/submit/:id', protect, submitQuiz);
router.get('/user/quizzes', protect, getUserQuizzes);
router.get('/user/history', protect, getUserHistory);

module.exports = router;
