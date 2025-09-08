// backend/src/models/Task.js
const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  subtasks: [subtaskSchema],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 30
  },
  actualDuration: {
    type: Number // in minutes
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String, // Store the original user input that generated this task
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  }
}, {
  timestamps: true
});

// Method to calculate completion percentage
taskSchema.methods.getCompletionPercentage = function() {
  if (this.subtasks.length === 0) {
    return this.isCompleted ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.isCompleted).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
};

// Method to mark task as completed
taskSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  
  // Mark all subtasks as completed
  this.subtasks.forEach(subtask => {
    if (!subtask.isCompleted) {
      subtask.isCompleted = true;
      subtask.completedAt = new Date();
    }
  });
};

module.exports = mongoose.model('Task', taskSchema);