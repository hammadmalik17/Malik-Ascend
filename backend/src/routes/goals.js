// backend/src/routes/goals.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Goal = require('../models/Goal');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all goals for user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId, isActive: true });
    
    // Update decay for all goals
    const updatedGoals = await Promise.all(
      goals.map(async (goal) => {
        goal.calculateDecay();
        await goal.save();
        return goal;
      })
    );

    res.json(updatedGoals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create goals
router.post('/', auth, [
  body('goals').isArray({ min: 1, max: 8 }),
  body('goals.*.name').trim().isLength({ min: 1, max: 50 }),
  body('goals.*.category').isIn(['Academic', 'Professional', 'Personal', 'Health', 'Skill', 'Other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goals } = req.body;

    // Create goals
    const createdGoals = await Promise.all(
      goals.map(async (goalData) => {
        const goal = new Goal({
          ...goalData,
          userId: req.userId
        });
        return await goal.save();
      })
    );

    // Update user's goals reference
    await User.findByIdAndUpdate(req.userId, {
      goals: createdGoals.map(g => g._id)
    });

    res.status(201).json(createdGoals);
  } catch (error) {
    console.error('Create goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update goal progress
router.patch('/:goalId/progress', auth, [
  body('points').isNumeric().isFloat({ min: 0, max: 50 })
], async (req, res) => {
  try {
    const { points } = req.body;
    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.addProgress(points);
    await goal.save();

    res.json(goal);
  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get radar chart data
router.get('/radar-data', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId, isActive: true });
    
    // Update decay and format for radar chart
    const radarData = await Promise.all(
      goals.map(async (goal) => {
        goal.calculateDecay();
        await goal.save();
        
        return {
          _id: goal._id,
          name: goal.name,
          currentScore: goal.currentScore,
          maxScore: goal.maxScore,
          color: goal.color,
          category: goal.category,
          currentStreak: goal.currentStreak,
          totalTasksCompleted: goal.totalTasksCompleted
        };
      })
    );

    res.json(radarData);
  } catch (error) {
    console.error('Get radar data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;