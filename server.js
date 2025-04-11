const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

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
    // if there is no entry for the username OR the password, let the user know at least one of the fields is missing
    if (!login || !password) {
        return res.status(400).json({ error: "Missing login or password" });
    }
    // if user entered both username and password, compare results against Users collection
    try {
        // connects to "fitgame" cluster
        const db = client.db('fitgame'); 
        const results = await db.collection('Users').find({ Login: login, Password: password }).toArray();

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        const user = results[0];
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

// register (commented out hashing, email, and stats for testing)
app.post('/api/register', async (req, res) => {
    try {
      const { FirstName, LastName, username, password } = req.body;
  
      const user = new User({
        FirstName,
        LastName,
        username,
        password,
        character: {
          name: username + "'s Hero",
          level: 1,
          xp: 0,
        },
      });
  
      await user.save();
      res.status(201).json({ error: "" }); // ✅ consistent response
    } catch (e) {
      console.error("Register error:", e);
      res.status(500).json({ error: "Server error: " + e.message });
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