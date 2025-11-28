// server/models/Goal.js
const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  completedAt: Date
});

module.exports = mongoose.model('Goal', GoalSchema);
