// backend/src/routes/tasks.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const { completed, goalId } = req.query;
    const filter = { userId: req.userId };
    
    if (completed !== undefined) {
      filter.isCompleted = completed === 'true';
    }
    
    if (goalId) {
      filter.goalId = goalId;
    }

    const tasks = await Task.find(filter)
      .populate('goalId', 'name color')
      .sort({ createdAt: -1 });

    // Add goal name and color to task objects
    const tasksWithGoalData = tasks.map(task => ({
      ...task.toObject(),
      goalName: task.goalId?.name,
      goalColor: task.goalId?.color
    }));

    res.json(tasksWithGoalData);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('goalId').isMongoId(),
  body('subtasks').optional().isArray({ max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskData = {
      ...req.body,
      userId: req.userId
    };

    const task = new Task(taskData);
    await task.save();
    
    const populatedTask = await Task.findById(task._id).populate('goalId', 'name color');
    
    res.status(201).json({
      ...populatedTask.toObject(),
      goalName: populatedTask.goalId?.name,
      goalColor: populatedTask.goalId?.color
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete task
router.patch('/:taskId/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.markCompleted();
    await task.save();

    // Update goal progress
    const goal = await Goal.findById(task.goalId);
    if (goal) {
      const points = task.priority === 'High' ? 8 : task.priority === 'Medium' ? 5 : 3;
      goal.addProgress(points);
      await goal.save();
    }

    res.json(task);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete subtask
router.patch('/:taskId/subtasks/:subtaskId/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    subtask.isCompleted = !subtask.isCompleted;
    subtask.completedAt = subtask.isCompleted ? new Date() : null;

    // Check if all subtasks are completed
    const allCompleted = task.subtasks.every(st => st.isCompleted);
    if (allCompleted && !task.isCompleted) {
      task.markCompleted();
      
      // Update goal progress
      const goal = await Goal.findById(task.goalId);
      if (goal) {
        const points = task.priority === 'High' ? 8 : task.priority === 'Medium' ? 5 : 3;
        goal.addProgress(points);
        await goal.save();
      }
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Complete subtask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
