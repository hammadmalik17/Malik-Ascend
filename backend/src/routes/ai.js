// backend/src/routes/ai.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const aiService = require('../services/aiService');
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const Reflection = require('../models/Reflection');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate tasks from user input
router.post('/generate-tasks', auth, [
  body('input').trim().isLength({ min: 1, max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { input } = req.body;
    
    // Get user's goals for context
    const goals = await Goal.find({ userId: req.userId, isActive: true });
    
    // Get recent tasks for context
    const recentTasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title');

    const userContext = {
      recentTasks: recentTasks.map(t => t.title).join(', '),
      skillLevel: 'Intermediate' // TODO: Add user skill tracking
    };

    const taskData = await aiService.generateTasks(input, goals, userContext);

    // Find the matching goal
    const matchingGoal = goals.find(g => 
      g.name.toLowerCase().includes(taskData.goalId?.toLowerCase()) ||
      taskData.goalId === g._id.toString()
    ) || goals[0];

    // Create the task
    const task = new Task({
      userId: req.userId,
      goalId: matchingGoal._id,
      title: taskData.mainTask,
      description: taskData.description,
      subtasks: taskData.subtasks.map(title => ({ title })),
      priority: taskData.priority,
      estimatedDuration: taskData.estimatedDuration,
      difficulty: taskData.difficulty,
      tags: taskData.tags,
      aiGenerated: true,
      aiPrompt: input
    });

    await task.save();
    
    const populatedTask = await Task.findById(task._id).populate('goalId', 'name color');
    
    res.json({
      ...populatedTask.toObject(),
      goalName: populatedTask.goalId?.name,
      goalColor: populatedTask.goalId?.color
    });
  } catch (error) {
    console.error('AI task generation error:', error);
    res.status(500).json({ message: 'Failed to generate task' });
  }
});

// Process daily reflection
router.post('/process-reflection', auth, [
  body('content').trim().isLength({ min: 10, max: 1000 }),
  body('mood').isIn(['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent']),
  body('productivity').isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, mood, productivity } = req.body;
    
    // Get today's completed tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedTasks = await Task.find({
      userId: req.userId,
      isCompleted: true,
      completedAt: { $gte: today, $lt: tomorrow }
    });

    // Get user's goals
    const goals = await Goal.find({ userId: req.userId, isActive: true });

    // Process with AI
    const analysis = await aiService.processReflection(content, completedTasks, goals);

    // Update goals based on AI analysis
    for (const update of analysis.goalUpdates) {
      const goal = goals.find(g => g.name === update.goalName);
      if (goal) {
        goal.addProgress(update.progressToAdd);
        await goal.save();
      }
    }

    // Save reflection
    const reflection = new Reflection({
      userId: req.userId,
      date: today,
      content,
      completedTasks: completedTasks.map(t => t._id),
      mood,
      productivity,
      aiAnalysis: {
        summary: analysis.summary,
        insights: analysis.insights,
        recommendations: analysis.recommendations
      },
      goalUpdates: analysis.goalUpdates.map(update => {
        const goal = goals.find(g => g.name === update.goalName);
        return {
          goalId: goal?._id,
          progressAdded: update.progressToAdd,
          previousScore: goal ? goal.currentScore - update.progressToAdd : 0,
          newScore: goal?.currentScore || 0
        };
      })
    });

    await reflection.save();

    res.json({
      reflection,
      analysis: {
        summary: analysis.summary,
        insights: analysis.insights,
        recommendations: analysis.recommendations
      },
      updatedGoals: goals.filter(g => 
        analysis.goalUpdates.some(u => u.goalName === g.name)
      )
    });
  } catch (error) {
    console.error('Reflection processing error:', error);
    res.status(500).json({ message: 'Failed to process reflection' });
  }
});

// General chat
router.post('/chat', auth, [
  body('message').trim().isLength({ min: 1, max: 500 })
], async (req, res) => {
  try {
    const { message } = req.body;
    
    // Get context
    const goals = await Goal.find({ userId: req.userId, isActive: true });
    const recentTasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(3);

    const context = {
      goals: goals,
      recentActivity: recentTasks.map(t => t.title).join(', ')
    };

    const response = await aiService.chat(message, context);
    
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Chat failed' });
  }
});

module.exports = router;