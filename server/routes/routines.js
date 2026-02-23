const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const { verifyToken } = require('../middleware/firebaseAuth'); 

// Secure all routine routes
router.use(verifyToken);

// GET: Fetch user's routines
router.get('/', async (req, res) => {
  try {
    const routines = await Routine.find({ user: req.user.uid }).sort({ createdAt: -1 });
    res.json(routines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a new routine
router.post('/', async (req, res) => {
  try {
    const newRoutine = new Routine({
      user: req.user.uid,
      title: req.body.title,
      startTime: req.body.startTime,
      durationMinutes: req.body.durationMinutes
    });
    const saved = await newRoutine.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Update a routine
router.put('/:id', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ msg: 'Not found' });
    if (routine.user !== req.user.uid) return res.status(403).json({ msg: 'Not authorized' });

    if (req.body.title !== undefined) routine.title = req.body.title;
    if (req.body.startTime !== undefined) routine.startTime = req.body.startTime;
    if (req.body.durationMinutes !== undefined) routine.durationMinutes = req.body.durationMinutes;

    const updated = await routine.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a routine
router.delete('/:id', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ msg: 'Not found' });
    if (routine.user !== req.user.uid) return res.status(403).json({ msg: 'Not authorized' });

    await routine.deleteOne();
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;