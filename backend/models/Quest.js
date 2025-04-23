const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    required: true
  },
  requirement: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'achievement'],
    required: true
  }
});

module.exports = mongoose.model('Quest', questSchema, 'Quests');