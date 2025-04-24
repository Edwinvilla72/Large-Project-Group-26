const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
const routineRoutes = require('./routes/routineRoutes');
const bodyParser = require("body-parser");
const User = require('./models/User');
const Workout = require('./models/Workout');
const Quest = require('./models/Quest');
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

    const existing = await User.findOne({ Login });
    if (existing) {
      return res.status(409).json({ error: "Username already exists. Please choose another." });
    }

    const SecQAnsHash = await bcrypt.hash(SecQAns, 10);
    const PasswordHash = await bcrypt.hash(Password, 10);

    const selectedDailyDocs = await Quest.aggregate([
      { $match: { type: "daily" } },
      { $sample: { size: 3 } }
    ]);

    const selectedDaily = selectedDailyDocs.map(q => q._id);

    if (selectedDaily.length < 3) {
      return res.status(500).json({ error: "Not enough daily quests in the database." });
    }

    const newUser = new User({
      FirstName,
      LastName,
      Login,
      Password: PasswordHash,
      SecQNum,
      SecQAns: SecQAnsHash,
      friends: [],
      character: {
        name: FirstName + "'s Hero",
        level: 1,
        xp: 0,
        questComp: 0,
        dailyQuests: selectedDaily,
        achievements: []
      }
    });

    await newUser.save();

    res.status(201).json({ error: "" });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ error: "Registration failed: " + e.message });
  }
});



// login api
app.post('/api/login', async (req, res) => {
  const { Login, Password } = req.body;

  if (!Login || !Password) {
    return res.status(400).json({ error: "Missing login or password" });
  }

  try {
    const user = await User.findOne({ Login });

    if (!user) {
      return res.status(401).json({ error: "Invalid username" });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const isNewDay = (lastDate) => {
      const now = new Date();
      const last = new Date(lastDate);
      return (
        now.getFullYear() !== last.getFullYear() ||
        now.getMonth() !== last.getMonth() ||
        now.getDate() !== last.getDate()
      );
    };

    if (isNewDay(user.lastDailyRefresh)) {
      const newDaily = await Quest.aggregate([
        { $match: { type: "daily" } },
        { $sample: { size: 3 } }
      ]);

      user.character.dailyQuests = newDaily.map(q => q._id.toString());
      user.lastDailyRefresh = new Date();
    }

    if (!user.loginTimestamps) user.loginTimestamps = [];
    user.loginTimestamps.push(new Date());

    await user.save();

    let fullDailyQuests = [];
    if (user.character.dailyQuests && user.character.dailyQuests.length > 0) {
      fullDailyQuests = await Quest.find({ _id: { $in: user.character.dailyQuests } });
    }

    return res.status(200).json({
      _id: user._id,
      FirstName: user.FirstName,
      LastName: user.LastName,
      dailyQuests: fullDailyQuests,
      error: ""
    });

  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "An error occurred during login" });
  }
});


// Quests (Fitness Tasks)
app.get('/api/quests', async (req, res) => {
  const quests = await Quest.find();
  res.json(quests);
});

// User Progress
app.post('/api/completeQuest', async (req, res) => {
  const { userId, questId } = req.body;

  try {
    const quest = await Quest.findById(questId);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const levelThreshold = 100;
    const totalXP = user.character.xp + quest.xp;
    const newLevel = Math.floor(totalXP / levelThreshold) + 1; // Users start at level 1

    user.character.xp = totalXP;
    user.character.level = newLevel;
    user.character.questComp++;

    await user.save();

    res.status(200).json({
      message: 'Quest completed and XP awarded',
      xp: user.character.xp,
      level: user.character.level
    });

  } catch (err) {
    console.error("Quest completion error:", err);
    res.status(500).json({ error: 'Server error completing quest' });
  }
});

//logging workouts and posting it to db
app.post("/api/logWorkout", async (req, res) => {
  try {
    const { userId, type, duration, reps } = req.body;

    const workout = new Workout({
      userId,
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
  try {
    const { userId, type, date } = req.query;

    if (!userId) {
      return res.status(404).send('User not found');
    }

    const filter = { userId: userId };

    if (type) {
      filter.type = type;
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(start.getDate());

      filter.timestamp = { $gte: start, $lt: end };
    }

    const workouts = await Workout.find(filter).sort({ timestamp: -1 });
    res.json(workouts);

  } catch (err) {
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

app.post('/api/getDailyQuests', async (req, res) => {
  // Add code for getting quests
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const questIds = user.character.dailyQuests || [];

    const quests = await Quest.find({ _id: { $in: questIds } });

    res.status(200).json({ dailyQuests: quests });
  } catch (err) {
    console.error("Error in getDailyQuests:", err);
    res.status(500).json({ error: "Server error while retrieving quests" });
  }
});

app.get('/api/getAllFollowees', async (req, res) => {
  // Add code for gathering followees (cycle through friends array in user object)
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing UserId' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followees = await User.find({ _id: { $in: user.friends } });

    const result = followees.map(followee => ({
      Login: followee.Login,
      FirstName: followee.FirstName,
      LastName: followee.LastName
    }));

    if (!user.friends || user.followees.length === 0) {
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

app.post('/api/follow', async (req, res) => {
  const { userId, followUser } = req.body;

  if (!userId || !followUser) {
    return res.status(400).json({ error: 'Missing userId or followUser.' });
  }

  try {
    const user = await User.findById(userId);
    const followee = await User.findOne({ Login: followUser });

    if (!user || !followee) return res.status(404).json({ error: 'User/Followee not found.' });

    if (userId === followee._id.toString()) return res.status(409).json({ error: 'You cannot follow yourself.' });

    if (user.friends.includes(followee._id)) return res.status(409).json({ error: 'User already followed.' });

    user.friends.push(followee._id);
    await user.save();

    res.status(200).json({ message: 'User has been followed.' });
  } catch (err) {
    console.error("Add friend error:", err);
    res.status(500).json({ error: 'Server error adding friend.' });
  }
});


app.delete('/api/unfollow', async (req, res) => {
  // Add code for deleting friends
  try {
    const { userId, followUser } = req.params;

    if (!userId || !followUser) {
      return res.status(400).json({ error: 'Missing userId or followUser' });
    }

    const user = await User.findById(userId);
    const followee = await User.findOne({ Login: followUser });

    if (!user || !followee) {
      return res.status(404).json({ error: 'User/friend not found' });
    }

    const followeeId = followee._id.toString();

    if (!user.friends.some(id => id.toString() === followeeId)) {
      return res.status(400).json({ error: `You are not following ${followUser}.` });
    }

    user.friends = user.friends.filter(id => id.toString() !== followeeId);
    await user.save();

    return res.status(200).json({ message: `You are no longer following ${followUser}.` })
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
      questComp: user.character.questComp,
      dailyQuests: user.character.dailyQuests,
      achievements: user.character.achievements
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

  if (!userId || !xp) {
    return res.status(400).json({ error: 'Missing userId or xp value' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const levelThreshold = 100;
    const totalXP = user.character.xp + xp;
    const newLevel = Math.floor(totalXP / levelThreshold) + 1; // Users start at level 1, thats why we are adding one.

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
  const { username } = req.query;

  if (!username) return res.status(400).json({ error: 'Missing username/login' });

  try {

    const user = await User.findOne({ Login: username });

    if (!user) return res.status(404).json({ error: 'User was not found' });

    res.status(200).json({
      userId: user._id,
      FirstName: user.FirstName,
      SecQNum: user.SecQNum
    });

  } catch (err) {
    console.error("Error getting security info:", err);
    res.status(500).json({ error: 'Server error while gathering security info' });
  }
});

app.post('/api/security-check', async (req, res) => {
  const { userId, SecQAns } = req.body;

  if (!userId || !SecQAns) return res.status(400).json({ error: 'Missing user id/question answer' });

  try {

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'User was not found' });

    const isMatch = await bcrypt.compare(SecQAns, user.SecQAns);

    if (!isMatch) return res.status(400).json({ error: 'Invalid answer' });

    res.status(200).json({
      userId: userId,
      oldPass: user.Password
    });

  } catch (err) {
    console.error("Error verifying security question:", err);
    res.status(500).json({ error: 'Server error while verifying security question answer' });
  }
});

app.post('/api/password-reset', async (req, res) => {
  const { oldPass, newPass, userId } = req.body;

  if (!userId || !newPass || !oldPass) return res.status(400).json({ error: 'Missing username, password, or old password verification' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User was not found' });

    if (oldPass !== user.Password) return res.status(400).json({ error: 'Verification failed' });

    user.Password = await bcrypt.hash(newPass, 10);
    await user.save();
    res.status(200).send('Your password has been updated.');

  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: 'Server error while resetting password' });
  }
});

app.delete('/api/delete-account', async (req, res) => {
  const { userId, verification_key } = req.body;
  try {
    if (!userId || !verification_key) res.status(400).json({ error: 'Missing userId/verification key' });

    if (verification_key !== "GERBERDAGOAT4331") res.status(400).json({ error: "Invalid verification key" });

    await User.deleteOne({ _id: userId });

    res.status(200).json({ msg: 'Account deleted.' });

  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: 'Server error when deleting account' });
  }
});

app.get('/api/getAllAchievements', async (req, res) => {
  try {
    const achievements = await Quest.find({ type: "achievement" });
    res.status(200).json(achievements);
  } catch (err) {
    console.error("Error getting achievement list:", err);
    res.status(500).json({ error: 'Server error when retrieving achievement list' });
  }
});

app.get('/api/getUserAchievements', async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      res.status(400).json({ error: 'Missing userId' });

      const user = await User.findById(userId);

      if (!user) res.status(404).json({ error: 'User not found' });

      res.status(200).json(user.character.achievements);
    } 
  } catch (err) {
    console.error("Error getting user achievement list:", err);
    res.status(500).json({ error: 'Server error when retrieving user achievement list' });
  }
});

app.post('/api/updateAchievement', async (req, res) => {
  const { userId, achievementId } = req.body;

  try {
    if (!userId || !achievementId) return res.status(400).json({ error: 'Missing userId or achievementId' });

    const achievementIdToCheck = new mongoose.Types.ObjectId(achievementId);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const achieveCheck = await User.findOne({
      _id: userId,
      "character.achievements": {
        $elemMatch: {
          0: achievementIdToCheck,
          1: "1"
        }
      }
    });

    if (achieveCheck) return res.status(400).json({ error: 'Achievement is already completed' });

    await User.updateOne(
      { _id: userId },
      {
        $push: {
          "character.achievements": [achievementIdToCheck, "1"]
        }
      }
    );

    return res.status(200).json({ message: 'Achievement completed' });
  } catch (err) {
    console.error("Error updating user's achievements:", err);
    res.status(500).json({ error: 'Server error when updating user\'s achievements' });
  }
});

// settings routine
app.use('/api/routine', require('./routes/routineRoutes'));




// ===== Server =====//
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`API running on port ${PORT}!`));
