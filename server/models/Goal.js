// server/models/Goal.js
const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  // 1. ADD THIS FIELD: Tag the goal with the user's Firebase UID
  user: { 
    type: String, 
    required: true,
    index: true
  },
  
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  completedAt: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);