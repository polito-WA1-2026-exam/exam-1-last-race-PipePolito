// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import UserDao from './dao_users.js';
import GameDao from './dao_games.js';

const userDao = new UserDao();
const gameDao = new GameDao();
// init express
const app = new express();
const port = 3001;

// middlewares
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions))

passport.use(new LocalStrategy(async function verify(email, password, cb) {
  const user = await userDao.getUserByCredentials(email, password);
  
  if(!user)
    //null -> no error, invalid credetials, message
    return cb(null, false, "Incorrect email or password."); // error message in the WWW-Authenticated header of the response
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: "Not authorized"});
}

app.use(session({
  secret: "Secret information to initialize the session",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));

/** User APIs **/
// POST /api/sessions
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).json({ error: info});
        }
        // success, perform the login and extablish a login session
        req.login(user, (err) => {
          if (err)
            return next(err);

          // req.user contains the authenticated user, we send all the user info back
          // this is coming from userDao.getUserByCredentials() in LocalStratecy Verify Function
          return res.json(req.user);
        });
    })(req, res, next);
  });

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get("/api/sessions/current", (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: "Not authenticated"});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

/** Game APIs **/
//GET /api/games/:id
// Get the game by ID, only if it belongs to the logged in user.
app.get('/api/games/:id', isLoggedIn, async (req, res) => {
  gameDao.getGame(req.params.id)
    .then((game) => {
      if(game.error)
        res.status(404).json(game);
      else
        res.json(game);
    })
    .catch((err) => {
      res.status(500).json({error: "Database error while retrieving game."});
    });
});

//GET /api/stations
// Get the list of stations for the planning phase of the game.
app.get('/api/stations', isLoggedIn, async (req, res) => {
  gameDao.listStations()
    .then((stations) => {
      res.json(stations);
    })
    .catch((err) => {
      res.status(500).json({error: "Database error while retrieving stations."});
    });
});

//POST /api/games
// Create a new game with a random start and end station (at least 3 connections apart).
app.post('/api/games', isLoggedIn, async (req, res) => {
  try {
    const { startId, endId } = await gameDao.pickStartAndEnd();
    const gameId = await gameDao.addGame({
      userId: req.user.id,
      startId,
      endId,
      status: 'planning',
      score: null,
      created: new Date().toISOString(),
      time: 0
    });
    res.status(201).json({ id: gameId, startStationId: startId, endStationId: endId });
  } catch (err) {
    res.status(500).json({ error: "Database error while creating game." });
  }
});


//PUT /api/games/:id
// Update the game time spent
app.put('/api/games/:id', isLoggedIn, async (req, res) => {
  const {timeSpent} = req.body;
  if (timeSpent === undefined) {
    return res.status(400).json({error: "Missing timeSpent in request body."});
  }
  try {
    await gameDao.updateTime({id: req.params.id, time: timeSpent});
    res.status(200).json({message: "Game updated successfully."});
  } catch (err) {
    res.status(500).json({error: "Database error while updating game."});
  }
});

//POST /api/games/:id/route
app.post('/api/games/:id/route', isLoggedIn, async (req, res) => {
  const gameId = Number(req.params.id);
  const { segments, timeSpent } = req.body;

  // — Basic input validation —
  if (!Array.isArray(segments) || segments.length < 3)
    return res.status(422).json({ error: "Route must have at least 3 segments." });

  try {
    // 1. Load game, check ownership and status
    const game = await gameDao.getGame(gameId);
    if (game.error)  return res.status(404).json(game);
    if (game.userId !== req.user.id) return res.status(403).json({ error: "Forbidden." });
    if (game.status !== 'planning')  return res.status(400).json({ error: "Game already completed." });

    // 2. Route must start and end at the assigned stations
    if (segments[0].fromId !== game.startId)
      return res.status(422).json({ error: "Route must start at the assigned station." });
    if (segments[segments.length - 1].toId !== game.endId)
      return res.status(422).json({ error: "Route must end at the assigned station." });

    // 3. Load network to validate segments
    const network = await gameDao.getNetwork();

    // Build a set of valid connections (bidirectional): "fromId-toId-lineId"
    const validConnections = new Set();
    // Build a map stationId → is_interchange
    const isInterchange = {};
    network.forEach(c => {
      validConnections.add(`${c.station1Id}-${c.station2Id}-${c.lineId}`);
      validConnections.add(`${c.station2Id}-${c.station1Id}-${c.lineId}`);
      isInterchange[c.station1Id] = c.station1IsInterchange;
      isInterchange[c.station2Id] = c.station2IsInterchange;
    });

    // 4. Validate each segment
    for (const seg of segments) {
      if (!validConnections.has(`${seg.fromId}-${seg.toId}-${seg.lineId}`))
        return res.status(422).json({ error: `Invalid segment: station ${seg.fromId} → ${seg.toId} on line ${seg.lineId}.` });
    }

    // 5. Line changes only allowed at interchange stations
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].lineId !== segments[i - 1].lineId) {
        const changeStation = segments[i].fromId;
        if (!isInterchange[changeStation])
          return res.status(422).json({ error: `Cannot change line at station ${changeStation} — not an interchange.` });
      }
    }

    // 6. Apply a random weighted event per segment
    const events = await gameDao.getAllEvents();
    const totalProb = events.reduce((sum, e) => sum + e.probability, 0);

    const pickEvent = () => {
      let rand = Math.random() * totalProb;
      for (const e of events) { rand -= e.probability; if (rand <= 0) return e; }
      return events[events.length - 1];
    };

    let totalDelta = 0;
    const processedSegments = segments.map((seg, i) => {
      const event = pickEvent();
      totalDelta += event.score;
      return { fromStationId: seg.fromId, toStationId: seg.toId, lineId: seg.lineId, coinDelta: event.score, eventName: event.name_event };
    });

    const finalCoins = Math.max(0, 20 + totalDelta);

    // 7. Persist and respond
    await gameDao.addSegments(gameId, processedSegments);
    await gameDao.finalizeGame(gameId, finalCoins);
    if (timeSpent !== undefined) await gameDao.updateTime({ id: gameId, time: timeSpent });

    res.json({ finalCoins, segments: processedSegments });

  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/network
app.get('/api/network', isLoggedIn, async (req, res) => {
  gameDao.getNetwork()
    .then((network) => {
      res.json(network);
    })
    .catch((err) => {
      res.status(500).json({error: "Database error while retrieving network."});
    });
});

// GET /api/ranking
app.get('/api/ranking', isLoggedIn, async (req, res) => {
  gameDao.getRanking()
    .then(rows => {
      res.json(rows);
    })
    .catch(err => {
      res.status(500).json({error: "Database error while retrieving ranking."});
    });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
