// server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const goalsRoutes = require('./routes/goals');
const activitiesRouter = require('./routes/activities');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allow parsing JSON bodies

// Connect to MongoDB
connectDB();

// Mount API routes
// (Auth is handled INSIDE these route files, so we don't need it globally here)
app.use('/api/goals', goalsRoutes);
app.use('/api/activities', activitiesRouter);

// Health route (Public - no auth needed)
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, time: new Date().toISOString() });
});

// Test route (Public)
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'Server is up. Backend minimal setup works.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});