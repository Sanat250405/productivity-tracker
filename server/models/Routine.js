const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  user: { 
    type: String, 
    required: true, 
    index: true 
  }, // Firebase UID
  title: { 
    type: String, 
    required: true 
  },
  startTime: { 
    type: String 
  }, // Stored as 'HH:MM'
  durationMinutes: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('Routine', RoutineSchema);