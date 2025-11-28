// server/controllers/goalsController.js
const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const g = new Goal({ title, description });
    await g.save();
    res.status(201).json(g);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// NEW: mark a goal as completed
exports.completeGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    if (goal.completed) return res.status(400).json({ error: 'Goal already completed' });

    goal.completed = true;
    goal.completedAt = new Date();
    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
