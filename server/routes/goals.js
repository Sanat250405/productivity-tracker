// server/routes/goals.js
const express = require('express');
const router = express.Router();
const controllers = require('../controllers/goalsController');
const { verifyToken } = require('../middleware/firebaseAuth'); 

// --- DEBUG LOGS ---
console.log('--- ROUTE DEBUG ---');
console.log('Loading Goals Route...');
console.log('1. getGoals is type:', typeof controllers.getGoals);
console.log('2. createGoal is type:', typeof controllers.createGoal);
console.log('3. verifyToken is type:', typeof verifyToken);

if (typeof controllers.getGoals !== 'function') {
    console.error('❌ CRITICAL ERROR: getGoals is NOT a function. Check controller exports!');
}
// ------------------

// explicitly attach middleware to ensure it runs
router.route('/')
  .get(verifyToken, controllers.getGoals)
  .post(verifyToken, controllers.createGoal);

router.route('/:id')
  .put(verifyToken, controllers.updateGoal)
  .delete(verifyToken, controllers.deleteGoal);

router.route('/:id/complete')
  .post(verifyToken, controllers.completeGoal);

module.exports = router;