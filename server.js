const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://Edwin123:12345@cluster0.jqhcjet.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);


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

var cardList =
    [
        'Roy Campanella',
        'Paul Molitor',
        'Tony Gwynn',
        'Dennis Eckersley',
        'Reggie Jackson',
        'Gaylord Perry',
        'Buck Leonard',
        'Rollie Fingers',
        'Charlie Gehringer',
        'Wade Boggs',
        'Carl Hubbell',
        'Dave Winfield',
        'Jackie Robinson',
        'Ken Griffey, Jr.',
        'Al Simmons',
        'Chuck Klein',
        'Mel Ott',
        'Mark McGwire',
        'Nolan Ryan',
        'Ralph Kiner',
        'Yogi Berra',
        'Goose Goslin',
        'Greg Maddux',
        'Frankie Frisch',
        'Ernie Banks',
        'Ozzie Smith',
        'Hank Greenberg',
        'Kirby Puckett',
        'Bob Feller',
        'Dizzy Dean',
        'Joe Jackson',
        'Sam Crawford',
        'Barry Bonds',
        'Duke Snider',
        'George Sisler',
        'Ed Walsh',
        'Tom Seaver',
        'Willie Stargell',
        'Bob Gibson',
        'Brooks Robinson',
        'Steve Carlton',
        'Joe Medwick',
        'Nap Lajoie',
        'Cal Ripken, Jr.',
        'Mike Schmidt',
        'Eddie Murray',
        'Tris Speaker',
        'Al Kaline',
        'Sandy Koufax',
        'Willie Keeler',
        'Pete Rose',
        'Robin Roberts',
        'Eddie Collins',
        'Lefty Gomez',
        'Lefty Grove',
        'Carl Yastrzemski',
        'Frank Robinson',
        'Juan Marichal',
        'Warren Spahn',
        'Pie Traynor',
        'Roberto Clemente',
        'Harmon Killebrew',
        'Satchel Paige',
        'Eddie Plank',
        'Josh Gibson',
        'Oscar Charleston',
        'Mickey Mantle',
        'Cool Papa Bell',
        'Johnny Bench',
        'Mickey Cochrane',
        'Jimmie Foxx',
        'Jim Palmer',
        'Cy Young',
        'Eddie Mathews',
        'Honus Wagner',
        'Paul Waner',
        'Grover Alexander',
        'Rod Carew',
        'Joe DiMaggio',
        'Joe Morgan',
        'Stan Musial',
        'Bill Terry',
        'Rogers Hornsby',
        'Lou Brock',
        'Ted Williams',
        'Bill Dickey',
        'Christy Mathewson',
        'Willie McCovey',
        'Lou Gehrig',
        'George Brett',
        'Hank Aaron',
        'Harry Heilmann',
        'Walter Johnson',
        'Roger Clemens',
        'Ty Cobb',
        'Whitey Ford',
        'Willie Mays',
        'Rickey Henderson',
        'Babe Ruth'
    ];

/* ===== API ENDPOINTS ===== */
// add card
app.post('/api/addcard', async (req, res, next) => {
    // incoming: userId, color
    // outgoing: error
    const { userId, card } = req.body;
    const newCard = { Card: card, UserId: userId };
    var error = '';
    try {
        const db = client.db('COP4331');
        const result = db.collection('Cards').insertOne(newCard);
    }
    catch (e) {
        error = e.toString();
    }
    cardList.push(card);
    var ret = { error: error };
    res.status(200).json(ret);
});

// login
app.post('/api/login', async (req, res, next) => {
  const { login, password } = req.body;

  if (!login || !password) {
      return res.status(400).json({ error: "Missing login or password" });
  }

  try {
      const db = client.db('fitgame'); 
      const users = db.collection('Users');

      const results = await users.find({ Login: login, Password: password }).toArray();

      if (results.length === 0) {
          return res.status(401).json({ error: "Invalid username or password" });
      }

      const user = results[0];

      // Added login timestamp - Abdiel
      await users.updateOne(
          { _id: user._id },
          { $push: { loginTimestamps: new Date() } }
      );

      return res.status(200).json({
          _id: user.UserId || user._id,
          FirstName: user.FirstName,
          LastName: user.LastName,
          error: ""
      });
  } catch (e) {
      console.error("Login error:", e);
      return res.status(500).json({ error: "An error occurred during login" });
  }
});

// register
app.post('/api/register', async (req, res) => {

    try {
      const { FirstName, LastName, username, password } = req.body;
  
      if (!FirstName || !LastName || !username || !password) {
        return res.status(400).json({ error: "Please fill out all fields." });
      }
  
      const db = client.db("fitgame");
      const users = db.collection("Users");
  
      // check for existing username
      const existing = await users.findOne({ Login: username });
      if (existing) {
        return res.status(409).json({ error: "Username already exists. Please choose another." });
      }
  
      const newUser = {
        // UserId, // TODO: UserId increment
        FirstName,
        LastName,
        Login: username, 
        Password: password,
        character: {
          name: username + "'s Hero",
          level: 1,
          xp: 0
        }
      };
  
      const result = await users.insertOne(newUser);
    
      res.status(201).json({ error: "" });
    } catch (e) {
      res.status(500).json({ error: "Registration failed: " + e.message });
    }
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


// Get Leaderboard (Top XP Users)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const db = client.db("fitgame");
    const users = await db.collection("Users")
      .find({})
      .sort({ 'character.xp': -1 })
      .limit(10)
      .toArray();

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


// search cards
app.post('/api/searchcards', async (req, res, next) => {
    // incoming: userId, search
    // outgoing: results[], error
    var error = '';
    const { userId, search } = req.body;
    var _search = search.trim();
    const db = client.db('COP4331');
    const results = await db.collection('Cards').find({ "Card": { $regex: _search + '.*' } }).toArray();
    var _ret = [];
    for (var i = 0; i < results.length; i++) {
        _ret.push(results[i].Card);
    }
    var ret = { results: _ret, error: error };
    res.status(200).json(ret);
});