const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Login: {
        type: String,
        required: true,
        unique: true,
    },
    Email: {
        type: String,
        required: false,
        unique: true,
    },
    Password: {
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
    },
    loginTimestamps: {
        type: [Date],
        default: []
    },
    
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'Users');
