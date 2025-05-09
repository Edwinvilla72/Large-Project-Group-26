// foundational imports/tools
const express = require('express');                          // the main framework for building this web server
const dotenv = require('dotenv').config();                   // for .env file
const connectDB = require('./config/db');                    // assists in establishing connection to the MongoDB database
// const authRoutes = require('./routes/authRoutes');
const routineRoutes = require('./routes/routineRoutes');     // for storing workout routines users store
const bodyParser = require("body-parser");                   // handles data that comes in from requests

// database models
const User = require('./models/User');                       
const Workout = require('./models/Workout');
const Quest = require('./models/Quest');

// security and managing logins
const jwt = require('jsonwebtoken');                        // JSON webtoken (for security and handling logins)
const bcrypt = require('bcryptjs');                         // how we hash passwords upon user registration

const app = express();                                      // create main express application object (where routes, middleware, etc. to)


// test
// app.get('/', (req, res) => {
//     res.send('Backend is running!');
// });


// cors = cross origin resourse sharing (LOCAL)
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'https://merntest.fitgame.space'],
  credentials: true
}));


// authenticationToken checks if incoming requests have valid JWT so that only valid requests are authorized
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);   // user needs to provide credentials

  // checks if token is valid
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);  // user provided invalid credentials
    req.user = user;                      // this gets attached to request
    next();                               // passes control over to next middleware or API
  });
}


connectDB();  // attempts to connect to the database 

app.use(express.json());                              // so that express server understands request bodies formatted as JSON
app.use(cors());                                      // resource sharing for deployed site
app.use(bodyParser.json());                           // standard for parsing JSON before Express
app.use(bodyParser.urlencoded({ extended: true }));   // standard for parsing JSON before Express
//app.use('/api/auth', authRoutes);


// ---register api---
// where user data is sent and checked for validity (if so, register them for the platform)
app.post('/api/register', async (req, res) => {
  try {
    
    const { FirstName, LastName, Login, Password, SecQNum, SecQAns } = req.body;      // required fields for body

    if (!FirstName || !LastName || !Login || !Password || !SecQAns) {                 // if any of these fields were not present in the users attempt to register...
      return res.status(400).json({ error: "Please fill out all fields." });          // (Bad Request Error) tell the user to make sure all fields have values
    }

    // checks if the new user's desired username is already taken
    const existing = await User.findOne({ Login });                                                 // attempts to find an existing instance of this login (using findOne)
    if (existing) {                                                                                 // if anything was found...
      return res.status(409).json({ error: "Username already exists. Please choose another." });    // (Conflict Error) tell the user this username has already been taken
    }

    // security (hashing)
    const SecQAnsHash = await bcrypt.hash(SecQAns, 10);     // uses bcrypt to encrypt the security question answer that the user provided
    const PasswordHash = await bcrypt.hash(Password, 10);   // uses bcrypt to encrypt the password that the user assigned to this account

    // if the user regsiters successfully, set up the user's initial set of daily quests to be any RANDOM 3 'daily' quests
    const selectedDailyDocs = await Quest.aggregate([
      { $match: { type: "daily" } },  // type of quest we are looking for is daily
      { $sample: { size: 3 } }        // we only need 3 of them
    ]);

    // format newly selected quests into an array of objects containing their ID and completion status (set this to false)
    const selectedDaily = selectedDailyDocs.map(q => ({
      questId: q._id,     // quest ID
      completed: false    // set this quests completion status to false (we literally JUST made the account)
    }));

  
    if (selectedDaily.length < 3) {                                                         // if for some reason we couldn't manage to find 3 daily quests from our database
      return res.status(500).json({ error: "Not enough daily quests in the database." });   // tell the user there was an issue (there are enough this is just for sanity)
    }

    // get the users IP address
    const ipAddress =
  req.headers['x-forwarded-for']?.split(',')[0] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress;

console.log(`Register attempt from IP: ${ipAddress}`);


// new user object using all of the data we took in
const newUser = new User({
  FirstName,
  LastName,
  Login,
  Password: PasswordHash,
  SecQNum,
  SecQAns: SecQAnsHash,
  friends: [],            // initializes friends array to empty (again, we JUST made the account)
  registerIp: ipAddress,  // saves the IP

  // character information
  character: {
    name: FirstName + "'s Hero",
    level: 1,                     // initializes level to 1
    xp: 0,                        // initializes XP to 0 points
    questComp: 0,                 // initializes number of quests completed to 0
    dailyQuests: selectedDaily,   // sets daily quests to the set we randomly pulled earlier

    // temp achievements for new users since none have been generated
    achievements: [
      {
        // every user starts with the level 1 achievement
        achievementId: new mongoose.Types.ObjectId("680ac5f01c41c331aa111d5e"), 
        progress: 1
      }
    ]
  }
});

    await newUser.save();                 // attempt to save information to the database
    res.status(201).json({ error: "" });  // successfully created the user (no error)
  } 
  catch (e) {
    // registration failed and returns an error
    console.error("Registration error:", e);
    res.status(500).json({ error: "Registration failed: " + e.message });
  }
});

// ---login api---
// handles a user's login request
app.post('/api/login', async (req, res) => {
  const { Login, Password } = req.body;   // required fields for body

  if (!Login || !Password) {                                                // if any fields were not entered byt he user
    return res.status(400).json({ error: "Missing login or password" });    // tell the user that something is missing
  }

  try {
    const user = await User.findOne({ Login });                   // attempts to find out whether the username entered exists in the database

    // username
    if (!user) {                                                  // if the user wasn't found in the database
      return res.status(401).json({ error: "Invalid username" }); // error, tell the user they entered a username that does not exist in the db
    }

    // password
    const isMatch = await bcrypt.compare(Password, user.Password);  // checks whether the password entered is the decrypted password that the username entered is associated with
    if (!isMatch) {                                                 // if the password entered does not match what we have stored in the database, 
      return res.status(401).json({ error: "Invalid password" });   // tells the user their password was incorrect
    }

    // daily quest refresh logic (if the user logs in on a new day)
    const isNewDay = (lastDate) => {                
      const now = new Date();                       // variable containing todays date
      const last = new Date(lastDate);              // the last day we had logged
      // checks if the day, month and year of todays date match with the previous. 
      return (
        now.getFullYear() !== last.getFullYear() ||
        now.getMonth() !== last.getMonth() ||
        now.getDate() !== last.getDate()
      );
      // true if today is a new day, false if it is the same day
    };

  
    if (isNewDay(user.lastDailyRefresh)) {      // if todays login is DIFFERENT than that of the previous login
      const newDaily = await Quest.aggregate([  // swap out the previous daily quests for 3 NEW RANDOM daily quests
        { $match: { type: "daily" } },
        { $sample: { size: 3 } }
      ]);
    
      // update daily quest array to reflect the new selections we found (if today was a new day)
      user.character.dailyQuests = newDaily.map(q => ({
        questId: q._id,
        completed: false    // initialize completion status to false so we can complete new quests later
      }));
    
      user.lastDailyRefresh = new Date();   // sets new lastDailyRefresh value to today's date for the next login to compare to
    }

    // if the user does not have a time stamp (maybe its their first time logging in)
    if (!user.loginTimestamps) user.loginTimestamps = [];
    user.loginTimestamps.push(new Date());  // adds the new date


    await user.save();  // save changes made to the user upon logging in

    // get details for current daily quests (quest description and XP to be awarded to the user)
    let fullDailyQuests = [];
    if (user.character.dailyQuests && user.character.dailyQuests.length > 0) {
      fullDailyQuests = await Quest.find({
        _id: { $in: user.character.dailyQuests.map(q => q.questId) }
      });      
    }

    // if everything is successful up to this point, we return a successful result
    return res.status(200).json({
      // return key user info for the frontend to use (JSON)
      _id: user._id,                  // user's id
      FirstName: user.FirstName,      // user's first name
      LastName: user.LastName,        // user's last name
      dailyQuests: fullDailyQuests    // sets dailyQuests array to the fullDailyQuests we just set
    });

  } catch (e) {
    // if anything went wrong along the way, error
    console.error("Login error:", e);                                           
    return res.status(500).json({ error: "An error occurred during login" });   
  }
});

// ---Quests (Fitness Tasks)---
// gets all quests and returns an array of them as JSON
app.get('/api/quests', async (req, res) => {
  const quests = await Quest.find();      // finds all possible quests in game
  res.json(quests);                       // result is a JSON file containing all quests 
});

// ---User Progress---
// upon completing quests, update the user's XP and quest completion status
app.post('/api/completeQuest', async (req, res) => {
  const { userId, questId } = req.body;   // required fields for body

  try {
    const quest = await Quest.findById(questId);                              // looks for the current quest by id 
    if (!quest) return res.status(404).json({ error: 'Quest not found' });    // if this quest could not be found, return an error

    const user = await User.findById(userId);                                 // look for the current user by id
    if (!user) return res.status(404).json({ error: 'User not found' });      // if the user could not be found, return an error

    const levelThreshold = 100;                                // 100 XP per level
    const totalXP = user.character.xp + quest.xp;              // awards user with quest XP (finds the total XP after adding)
    const newLevel = Math.floor(totalXP / levelThreshold) + 1; // Users start at level 1. Calculates new level after XP has been added

    // changes user stats
    user.character.xp = totalXP;       // updates user's xp
    user.character.level = newLevel;   // updates user's level (if applicable)
    user.character.questComp++;        // updates user's number of completed quests 

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

// ===leaderboard api===
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
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const questIds = user.character.dailyQuests?.map(q => q.questId) || [];

    const quests = await Quest.find({ _id: { $in: questIds } });

    const dailyMap = {};
    user.character.dailyQuests.forEach(q => {
      dailyMap[q.questId.toString()] = q.completed;
    });

    const formatted = quests.map(q => ({
      ...q.toObject(),
      completed: dailyMap[q._id.toString()] || false
    }));

    res.status(200).json({ dailyQuests: formatted });

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

    if (!followees || followees.length === 0) {
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


app.delete('/api/unfollow/:userId/:followUser', async (req, res) => {
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
  const { userId, xp, questId } = req.body;

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

    if (questId) {
      const dailyEntry = user.character.dailyQuests.find(q => q.questId.toString() === questId.toString());
      if (dailyEntry) dailyEntry.completed = true;
    }

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

// get current user's achievements
app.get('/api/getUserAchievements', async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const formattedAchievements = Array.isArray(user.character.achievements)
        ? user.character.achievements.map((ach) => ({
          achievementId: ach.achievementId.toString(),
          progress: ach.progress
        }))
        : [];

    return res.status(200).json({ achievements: formattedAchievements });
  } catch (err) {
    console.error("Error getting user achievement list:", err);
    res.status(500).json({ error: "Server error when retrieving user achievement list" });
  }
});

// update achievement
app.post('/api/updateAchievement', async (req, res) => {
  const { userId, achievementId } = req.body;

  try {
    if (!userId || !achievementId) {
      return res.status(400).json({ error: 'Missing userId or achievementId' });
    }

    const achievementIdToCheck = new mongoose.Types.ObjectId(achievementId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already completed
    const achieveCheck = await User.findOne({
      _id: userId,
      "character.achievements": {
        $elemMatch: {
          0: achievementIdToCheck,
          1: "1"
        }
      }
    });

    if (achieveCheck) {
      return res.status(400).json({ error: 'Achievement is already completed' });
    }

    //  Correct push format
    await User.updateOne(
        { _id: userId },
        {
          $push: {
            "character.achievements": {
              achievementId: achievementIdToCheck,
              progress: 1
            }
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


// generate text using OpenAI
const fetch = require('node-fetch'); // at top if not already imported
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a motivating, knowledgeable gym partner. You know the user's goals and suggest exercises, nutrition tips, and encouragement."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    console.log("🔍 OpenAI raw response:", JSON.stringify(data, null, 2)); // logs actual structure
    
    if (!response.ok) {
      console.error("OpenAI error response:", data);
      return res.status(response.status).json({ error: data.error?.message || "OpenAI error" });
    }
    
    const message = data.choices?.[0]?.message?.content;
    
    if (!message) {
      console.error("❌ No message found in OpenAI response", data);
      return res.status(500).json({ error: "No message returned from OpenAI" });
    }
    
    return res.json({ result: message });
    
  } 
  catch (error) {
    console.error("OpenAI fetch error:", error);
    res.status(500).json({ error: 'Server error generating response' });
  }
});




// ===== Server =====//
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`API running on port ${PORT}!`));
