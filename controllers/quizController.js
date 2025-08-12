// controllers/quizController.js
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @desc    Get all quizzes and categories
// @route   GET /api/quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('-questions'); // Don't send questions for category page
    const categories = [...new Set(quizzes.map(quiz => quiz.category))];
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/:id
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer'); // Remove correct answers
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit a quiz and calculate score
// @route   POST /api/quizzes/submit/:id
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { userAnswers } = req.body;
    let score = 0;

    userAnswers.forEach((answer, index) => {
      if (quiz.questions[index] && quiz.questions[index].correctAnswer === answer) {
        score++;
      }
    });

    // Save quiz result to user's history
    const user = await User.findById(req.user);
    if (user) {
      user.quizzesTaken.push({ quizId: quiz._id, score });
      await user.save();
    }

    res.json({ score });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get quizzes taken by user
// @route   GET /api/quizzes/user/quizzes
const getUserQuizzes = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('quizzesTaken.quizId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const quizzesTaken = user.quizzesTaken.map(record => ({
      quizId: record.quizId._id,
      title: record.quizId.title,
      category: record.quizId.category
    }));
    
    res.json(quizzesTaken);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's full history
// @route   GET /api/quizzes/user/history
const getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('quizzesTaken.quizId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const history = user.quizzesTaken.map(record => ({
      quizId: record.quizId._id,
      quizTitle: record.quizId.title,
      score: record.score,
      date: record.date
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getUserQuizzes,
  getUserHistory,
};
