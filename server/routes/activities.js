// server/routes/activities.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { verifyToken } = require('../middleware/firebaseAuth'); // <--- 1. Import Middleware

// 2. Apply Middleware: This creates 'req.user' for all routes below
router.use(verifyToken);

// --- ROUTES ---

// 1. GET: Only fetch activities belonging to the logged-in user
router.get('/', async (req, res) => {
  try {
    // Only find activities where user matches the logged-in Firebase UID
    const activities = await Activity.find({ user: req.user.uid }) 
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Save the activity with the current user's ID
router.post('/', async (req, res) => {
  try {
    const newActivity = new Activity({
      user: req.user.uid, // <--- CRITICAL: Tag with Firebase UID
      type: req.body.type,
      title: req.body.title,
      refId: req.body.refId,
      dateString: req.body.dateString,
      completedAt: req.body.completedAt
    });

    const saved = await newActivity.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE: Ensure a user can only delete THEIR OWN activity
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) return res.status(404).json({ msg: 'Not found' });

    // Security Check: Does the logged-in user own this?
    if (activity.user !== req.user.uid) {
      return res.status(403).json({ msg: 'Not authorized to delete this' });
    }

    await activity.deleteOne();
    res.json({ msg: 'Activity removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;