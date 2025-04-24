const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: true
  },
  Description: {
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