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


// app.get('/', (req, res) => {
//     res.send('Backend is running!');
// });


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
        const { FirstName, LastName, Login, Password, SecQNum, SecQAns } = req.body;

        if (!FirstName || !LastName || !Login || !Password || !SecQAns) {
            return res.status(400).json({ error: "Please fill out all fields." });
        }

        //const db = client.db("fitgame");
        //const users = db.collection("Users");

        // check for existing username
        const existing = await User.findOne({ Login });
        if (existing) {
            return res.status(409).json({ error: "Username already exists. Please choose another." });
        }

        const SecQAnsHash = await bcrypt.hash(SecQAns, 10);
        const PasswordHash = await bcrypt.hash(Password, 10);

        const newUser = new User({
            FirstName,
            LastName,
            Login,
            Password: PasswordHash,
            SecQNum,
            SecQAns: SecQAnsHash,
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

        const isMatch = await bcrypt.compare(Password, user.Password);
        
        if (!isMatch) {
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

app.get('/api/getQuests', async (req, res) => {
    // Add code for getting quests
});

app.get('/api/getAllFriends', async (req, res) => {
    // Add code for gathering friends (cycle through friends array in user object)
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'Missing UserId' });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const friends = await User.find({ _id: { $in: user.friends } });

      const result = friends.map(friend => ({
        Login: friend.Login,
        FirstName: friend.FirstName,
        LastName: friend.LastName
      }));

      if (!user.friends || user.friends.length === 0) {
        return res.status(204).end();
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error fetching following list' });
    }
});

// add friend
const mongoose = require('mongoose'); // at the top if not imported

app.post('/api/addFriend', async (req, res) => {
  const { userId, friendUser } = req.body;

  if (!userId || !friendUser) {
    return res.status(400).json({ error: 'Missing userId or friendUser' });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findOne({Login: friendUser});

    if (!user || !friend) {
      return res.status(404).json({ error: 'User or Friend not found' });
    }

    const friendObjectId = new mongoose.Types.ObjectId(friend._id);

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
    try {
      const { userId, friendUser } = req.params;

      if (!userId || !friendUser) {
        return res.status(400).json({ error: 'Missing userId or friendUser' });
      }

      const user = await User.findById(userId);
      const friend = await User.findOne({Login: friendUser}); 

      if (!user || !friend ) {
        return res.status(404).json({ error: 'User/friend not found' });
      }

      const friendId = friend._id.toString();

      if (!user.friends.some(id => id.toString() === friendId)) {
        return res.status(400).json({ error:`You are not following ${friendUser}.` });
      }

      user.friends = user.friends.filter(id => id.toString() !== friendId);
      await user.save();
  
      return res.status(200).json({ message: `You are no longer following ${friendUser}.`})
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error fetching following list' });
    }
});

app.get('/api/getProfile', async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) return res.status(400).json({ error: 'Missing userId' });

      const user = await User.findById(userId);

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.status(200).json({
        FirstName: user.FirstName,
        LastName: user.LastName,
        level: user.character.level,
        xp: user.character.xp,
        questComp: user.character.questComp
      });
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error fetching profile' });
    }
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
      user.character.questComp++;
  
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
    const { userId, field } = req.body;
});

app.get('/api/get-security-question', async (req, res) => {
    const { Login } = req.query;

    if (!Login) return res.status(400).json({ error: 'Missing username/login' });

    try {
      
      const user  = User.findOne({ Login });

      if (!user) return res.status(404).json({ error: 'User was not found' });

      res.status(200).json({
        SecQAns: user.SecQAns
      });

    } catch (err) {
      console.error("Error getting security info:", err);
      res.status(500).json({ error: 'Server error while gathering security info' });
    }
});


// settings routine
app.use('/api/routine', require('./routes/routineRoutes'));




// ===== Server =====//
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`API running on port ${PORT}!`));
