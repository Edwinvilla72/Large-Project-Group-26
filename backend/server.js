const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
const routineRoutes = require('./routes/routineRoutes');
const bodyParser = require("body-parser");
const User = require('./models/User');
const Workout = require('./models/Workout');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // or 'bcrypt' if you're using that instead
const app = express();


// cors
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // this gets attached to req
        next();
    });
}


connectDB();


app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use('/api/auth', authRoutes);

app.post('/api/register', async (req, res) => {

    try {
        const { FirstName, LastName, username, password,email } = req.body;

        if (!FirstName || !LastName || !username || !password) {
            return res.status(400).json({ error: "Please fill out all fields." });
        }

        //const db = client.db("fitgame");
        //const users = db.collection("Users");

        // check for existing username
        const existing = await User.findOne({ Login: username });
        if (existing) {
            return res.status(409).json({ error: "Username already exists. Please choose another." });
        }

        const userCount = await User.countDocuments();
        const newUser = new User({
            FirstName,
            LastName,
            Login: username,
            Password: password,
            Email: email || "",
            friends: [], // added friends to new users
            character: {
                name: FirstName + "'s Hero",
                level: 1,
                xp: 0
            }
        });

        //const result = await users.insertOne(newUser);
        await newUser.save();

        res.status(201).json({ error: "" });
    } catch (e) {
        res.status(500).json({ error: "Registration failed: " + e.message });
    }
});


// login api
app.post('/api/login', async (req, res, next) => {
    const { Login, Password } = req.body;

    if (!Login || !Password) {
        return res.status(400).json({ error: "Missing login or password" });
    }

    try {
        //const user = await User.findOne({ Login: Login, Password: Password });

        // if (!user) {
        //     return res.status(401).json({ error: "Invalid username or password" });
        // }

        const user = await User.findOne({ Login });

        if (!user) {
          return res.status(401).json({ error: "Invalid username" });
        }
        
        if (user.Password !== Password) {
          return res.status(401).json({ error: "Invalid password" });
        }

        if (!user.loginTimestamps) user.loginTimestamps = [];
        await User.findByIdAndUpdate(user._id, {
            $push: { loginTimestamps: new Date() }
        });

        return res.status(200).json({
            _id: user._id,
            FirstName: user.FirstName,
            LastName: user.LastName,
            error: ""
        });

    } catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({ error: "An error occurred during login" });
    }
});

// Quests (Fitness Tasks)
app.get('/api/quests', authenticateToken, async (req, res) => {
    const quests = await Quest.find();
    res.json(quests);
});

// User Progress
app.post('/api/completeQuest', authenticateToken, async (req, res) => {
    const { questId, progress } = req.body;
    const quest = await Quest.findById(questId);
    if (!quest) return res.status(404).send('Quest not found');

    if (progress >= quest.requirement) {
        const user = await User.findById(req.user.id);
        user.character.xp += quest.xpReward;
        user.character.questComp++;
        user.character.quests[questId] = quest.requirement;
        // Leveling logic (placeholder)
        if (user.character.xp >= user.character.level * 100) {
            user.character.level++;
            user.character.xp = 0; // Optionally subtract instead
            // Update stats logic here
        }
        await user.save();
        res.send('Quest completed and XP rewarded');
    } else {
        user.character.quests[questId] = progress;
        res.status(400).send('Not enough progress');
    }
});

//logging workouts and posting it to db
app.post("/api/logWorkout", async (req, res) => {
    try {
    const { UserId, type, duration, reps } = req.body;

    const workout = new Workout({
        UserId,
        type,
        duration,
        reps
    });

        await workout.save();
        res.status(200).json({ message: "Workout logged" });
    } catch (err) {
        res.status(500).json({ error: "Failed to log workout" });
    }
});

//retrieve workouts by day or workout
app.get('/api/getWorkout', async (req, res) => {
    try{
        const { UserId, type, date} = req.query;

        if(!UserId){
            return res.status(404).send('User not found');
        }

        const filter = {UserId:UserId};

        if(type){
            filter.type = type;
        }

        if(date){
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(start.getDate());

            filter.timestamp = { $gte: start, $lt: end };
        }

        const workouts = await Workout.find(filter).sort({ timestamp: -1 });
        res.json(workouts);

    }catch (err) {
        console.error("Workout fetch error:", err);
        res.status(500).json({ error: "Failed to retrieve workouts" });
    }


});


// Get Leaderboard (Top XP Users)
//app.get('/api/leaderboard', async (req, res) => {
    //const users = await User.find().sort({ 'character.xp': -1 }).limit(10);
    //res.json(users.map(u => ({ username: u.username, level: u.character.level, xp: u.character.xp })));
//});

app.get('/api/leaderboard', async (req, res) => {
    try {
      const users = await User.find({})
        .sort({ 'character.xp': -1 })
        .limit(10);
  
      const formatted = users.map(u => ({
        username: u.Login,
        level: u.character?.level ?? 1,
        xp: u.character?.xp ?? 0,
      }));
  
      res.json(formatted);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to load leaderboard" });
    }
  });
  

  // get friends for leaderboard
  app.get('/api/leaderboard/friends/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const user = await User.findById(userId); // 🔍 This is where the 404 likely came from
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      const friendIds = user.friends || [];
  
      const friends = await User.find({ _id: { $in: friendIds } })
      .sort({ 'character.xp': -1 })
      .select('Login character');    
  
      const result = friends.map(friend => ({
        username: friend.Login,
        level: friend.character?.level ?? 1,
        xp: friend.character?.xp ?? 0,
      }));
  
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error fetching friends leaderboard' });
    }
  });  

  // get stats(?)
app.get('/api/getStats', async (req, res) => {
    // Add code for getting stats (character)
});



app.get('/api/getQuests', async (req, res) => {
    // Add code for getting quests
});

app.get('/api/getAllFriends', async (req, res) => {
    // Add code for gathering friends (cycle through friends array in user object)
});

// add friend
const mongoose = require('mongoose'); // at the top if not imported

app.post('/api/addFriend', async (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({ error: 'Missing userId or friendId' });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: 'User or Friend not found' });
    }

    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    if (user.friends.includes(friendObjectId)) {
      return res.status(409).json({ error: 'Friend already added' });
    }

    user.friends.push(friendObjectId);
    await user.save();

    res.status(200).json({ message: 'Friend added successfully' });
  } catch (err) {
    console.error("Add friend error:", err);
    res.status(500).json({ error: 'Server error adding friend' });
  }
});


app.delete('/api/removeFriend', async (req, res) => {
    // Add code for deleting friends
});

app.get('/api/getProfile', async (req, res) => {
    // Add code for loading profile (specifically username, first/last name stuff like that)
});

// logs completion of quests (awards user with XP)
app.post('/api/quests/complete', async (req, res) => {
    const { userId, xp } = req.body;
  
    if (!userId || typeof xp !== 'number') {
      return res.status(400).json({ error: 'Missing userId or xp value' });
    }
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      const levelThreshold = 100;
      const totalXP = user.character.xp + xp;
      const newLevel = Math.floor(totalXP / levelThreshold);
  
      user.character.xp = totalXP;
      user.character.level = newLevel;
  
      await user.save();
  
      res.status(200).json({
        message: 'XP awarded successfully',
        xp: user.character.xp,
        level: user.character.level
      });
    } catch (err) {
      console.error("Error awarding XP:", err);
      res.status(500).json({ error: 'Server error while awarding XP' });
    }
  });
  
  



app.post('/api/updateProfile', async (req, res) => {
    // Add code for updating information on profile (first/last name and probably password too?)
});


// settings routine
app.use('/api/routine', require('./routes/routineRoutes'));




// ===== Server =====
app.listen(3000, () => console.log('API running on http://localhost:3000'));
