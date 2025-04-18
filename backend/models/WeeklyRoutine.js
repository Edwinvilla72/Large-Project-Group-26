const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  routine: {
    type: Map,
    of: [String],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyRoutine', RoutineSchema);