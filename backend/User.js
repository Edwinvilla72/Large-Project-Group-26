const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    character: {
        name: String,
        level: Number,
        xp: Number,
        dailyQuests: [Number],
        weeklyQuests: [Number],
        questProgress: [Number],
        questComp: Number,
        // stats: {
        //     strength: Number,
        //     stamina: Number,
        //     agility: Number
        // }
    },
    friends: {
        type: [Number],
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
