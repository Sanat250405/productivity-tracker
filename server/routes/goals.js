// server/routes/goals.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/goalsController');

router.get('/', controller.getGoals);
router.post('/', controller.createGoal);
router.post('/:id/complete', controller.completeGoal);
router.delete('/:id', controller.deleteGoal);

module.exports = router;
