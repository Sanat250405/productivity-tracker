// server/models/Activity.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  // The Firebase User ID (Required so we know whose activity this is)
  user: { 
    type: String, 
    required: true, 
    index: true 
  }, 

  // 'goal' or 'routine'
  type: { 
    type: String, 
    enum: ['goal', 'routine'],
    required: true 
  },

  // The name of the goal/routine (e.g., "Read Book") - Needed for UI
  title: { 
    type: String, 
    required: true 
  },

  // ID of the original goal/routine
  refId: { 
    type: String 
  }, 

  // "YYYY-MM-DD" string for easy grouping on Dashboard/Consistency pages
  dateString: { 
    type: String, 
    required: true,
    index: true
  },

  completedAt: { 
    type: Date, 
    default: Date.now 
  },
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);