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
    Password: {
        type: String,
        required: true,
    },
    SecQNum: {
        type: Number,
        required: true
    },
    SecQAns: {
        type: String,
        required: true
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
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    loginTimestamps: {
        type: [Date],
        default: []
    },
    
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'Users');
