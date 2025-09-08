const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  category: {
    type: String,
    enum: ['Academic', 'Professional', 'Personal', 'Health', 'Skill', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    maxlength: 200
  },
  currentScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maxScore: {
    type: Number,
    default: 100
  },
  decayRate: {
    type: Number,
    default: 2,
    min: 0,
    max: 10
  },
  color: {
    type: String,
    default: '#3B82F6' // Tailwind blue-500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastScoreUpdate: {
    type: Date,
    default: Date.now
  },
  totalTasksCompleted: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to calculate decay and update score
goalSchema.methods.calculateDecay = function() {
  const now = new Date();
  const daysSinceUpdate = Math.floor((now - this.lastScoreUpdate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceUpdate > 0) {
    const decayAmount = daysSinceUpdate * this.decayRate;
    this.currentScore = Math.max(0, this.currentScore - decayAmount);
    this.lastScoreUpdate = now;
    
    // Reset streak if inactive for more than 1 day
    if (daysSinceUpdate > 1) {
      this.currentStreak = 0;
    }
  }
  
  return this.currentScore;
};

// Method to add progress
goalSchema.methods.addProgress = function(points = 5) {
  this.currentScore = Math.min(this.maxScore, this.currentScore + points);
  this.lastScoreUpdate = new Date();
  this.totalTasksCompleted += 1;
  
  // Update streak logic
  const today = new Date().toDateString();
  const lastUpdate = new Date(this.lastScoreUpdate).toDateString();
  
  if (today !== lastUpdate) {
    this.currentStreak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
  }
};

module.exports = mongoose.model('Goal', goalSchema);

// backend/src/models/Task.js