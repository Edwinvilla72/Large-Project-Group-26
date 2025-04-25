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
    registerIp: {
        type: String,
        default: ''
    },      
    character: {
        name: String,
        level: Number,
        xp: Number,
        dailyQuests: [{
            questId: {
              type: mongoose.Schema.Types.ObjectId,
              required: true
            },
            completed: {
              type: Boolean,
              default: false
            }
          }],
        achievements: [{
            achievementId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            progress: {
                type: Number,
                required: true
            }
        }],
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
    lastDailyRefresh: {
        type: Date,
        default: new Date(0) // epoch time (way in the past)
    }  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'Users');
