const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
    UserId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    }, // minutes or seconds
    reps: {
        type: Number,
        required: false
    }, // optional if it's not a strength workout
    timestamp: {
        type: Date,
        default: Date.now }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
