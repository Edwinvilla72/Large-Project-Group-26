const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require("cors");
const bodyParser = require("body-parser");

//dotenv.config();
//connectDB();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://Edwin123:12345@cluster0.jqhcjet.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);
client.connect();

// test
client.connect()
    .then(async () => {
        console.log("✅ Connected to MongoDB!");

        // Quick test: List databases
        const databasesList = await client.db().admin().listDatabases();
        console.log("📂 Databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    })
    .catch(err => {
        console.error("❌ Failed to connect to MongoDB:", err);
    });



app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});
app.listen(5000); // start Node + Express server on port 5000


const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User ({
        username,
        email,
        password: hashed,
        character: {
            name: username + "'s Hero",
            level: 1,
            xp: 0,
            dailyQuests: [], // Change this to the function that generates daily quests for a user.
            weeklyQuests: [], // Change this to the function that generates weekly quests for a user.
            questProgress: [0,0,0,0,0,0,0,0,0,0],
            questComp: 0,
            //stats: { strength: 5, stamina: 5, agility: 5 },
        },
        friends: [],
    });
    await user.save();
    res.status(201).send('User registered');
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).send('Invalid credentials');
    const token = jwt.sign({ id: user._id }, 'secret');
    res.json({ token });
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
    const { UserId, type, duration, reps } = req.body;

    const workout = {
        UserId,
        type,
        duration,
        reps,
        timestamp: new DataTransfer()
    };
    try {
        const db = client.db("fitgame");
        await db.collection("workouts").insertOne(workout);
        res.status(200).json({ message: "Workout logged" });
    } catch (err) {
        res.status(500).json({ error: "Failed to log workout" });
    }
});

// Get Leaderboard (Top XP Users)
app.get('/api/leaderboard', async (req, res) => {
    const users = await User.find().sort({ 'character.xp': -1 }).limit(10);
    res.json(users.map(u => ({ username: u.username, level: u.character.level, xp: u.character.xp })));
});

app.get('/api/getStats', async (req, res) => {
    // Add code for getting stats (character)
});

app.get('/api/getQuests', async (req, res) => {
    // Add code for getting quests
});

app.get('/api/getAllFriends', async (req, res) => {
    // Add code for gathering friends (cycle through friends array in user object)
});

app.post('/api/addFriend', async (req, res) => {
    // Add code for adding friends
    // Arrays auto increase in size, utilize .push to add to the friends array that exists in the user object. pretty simple
});

app.delete('/api/removeFriend', async (req, res) => {
    // Add code for deleting friends
});

app.get('/api/getProfile', async (req, res) => {
    // Add code for loading profile (specifically username, first/last name stuff like that)
});

app.post('/api/updateProfile', async (req, res) => {
    // Add code for updating information on profile (first/last name and probably password too?)
});

// ===== Server =====
app.listen(3000, () => console.log('API running on http://localhost:3000'));
