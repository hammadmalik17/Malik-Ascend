// backend/src/models/Reflection.js
const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  completedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  goalUpdates: [{
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    },
    progressAdded: Number,
    previousScore: Number,
    newScore: Number
  }],
  mood: {
    type: String,
    enum: ['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'],
    required: true
  },
  productivity: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  aiAnalysis: {
    summary: String,
    insights: [String],
    recommendations: [String]
  }
}, {
  timestamps: true
});

// Ensure one reflection per user per day
reflectionSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Reflection', reflectionSchema);
