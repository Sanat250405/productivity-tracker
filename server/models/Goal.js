// server/models/Goal.js
const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  // The User ID (Required to link goal to a person)
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

// THIS LINE IS CRITICAL - It exports the model so the controller can use it
module.exports = mongoose.model('Goal', GoalSchema);