let express = require('express');
let cors = require('cors');
let socket = require('socket.io');
let session = require("express-session");
let bodyParser = require("body-parser");
let MongoStore = require("connect-mongo")(session);
let mongoClient = require("mongodb").MongoClient;
let bcrypt = require("bcryptjs");
let fs = require("fs");
let https = require("https");

let HASH_SALT_ROUNDS = 11;

const MONGO_URL = "mongodb://localhost:27017/chess";

let port = 443;

let app = express();

let db;

let sessionMiddleware = session({
  secret: "Secret stuff",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    url: MONGO_URL,
    autoReconnect: true,
    clear_interval: 3600
  })
});

app.use(sessionMiddleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors());
app.options('*', cors());

app.use(express.static(__dirname + '/public'));


//database connection
mongoClient.connect(MONGO_URL, {useNewUrlParser: true}, function(err, database) {
  if(err) throw err;

  console.log("Connected to the database");
  let dbo = database.db("chess");
  db = dbo;
});


//routing
app.get("/", function(req, res) {
  if(req.session.username) {
    res.sendFile(__dirname + "/public/home.html");
  } else {
    res.sendFile(__dirname + "/public/login.html");
  }
});

app.post("/signup", function(req, res) {
  req.session.username = req.body.username;

  //hash-salt password before storing it

  bcrypt.hash(req.body.password, HASH_SALT_ROUNDS, function(err, hash) {
    db.collection("users").insertOne({
      name: req.body.name,
      username: req.body.username,
      password: hash
    }, function(e, d) {});
    res.send("done");
  });
});

app.post("/login", function(req, res) {
  req.session.username = req.body.username;
  let user = db.collection("users").findOne({
    username: req.body.username
  }, function(err, data) {
    if(err) throw err;
    if(data == null) {
      res.send("wrong");
      return;
    }
    bcrypt.compare(req.body.password, data.password, function(errr, result) {
      if(result) {
        //everything fine
        res.send("done");
      } else {
        res.send("wrong");
      }
    });
    // if(data.password == req.body.password) {
    //   //everything alright
    //   res.send("done");
    // } else {
    //   res.send("wrong");
    // }
  });
});

app.get("/home", function(req, res) {
  if(req.session.username) {
    //there is a session
    res.sendFile(__dirname + "/public/home.html");
  } else {
    //no session
    res.sendFile(__dirname + "/public/login.html");
  }
});

app.get("/userInfo", function(req, res) {
  if(req.session.username) {
    let filter = {
      $or: [{white: req.session.username}, {black: req.session.username}]
    };

    db.collection("games").find(filter).sort({date: -1}).toArray(function(err, result) {
      let wins, losses;
      wins = losses = 0;
      for(let i = 0; i < result.length; i++) {
        if(result[i].winner == req.session.username) {
          wins++;
        } else if(result[i].winner != "none") {
          losses++;
        }
      }
      let r = [];
      for(let i = 0; i < 10; i++) {
        r[i] = result[i];
      }
      res.send({
        username: req.session.username,
        games: result,
        totalGames: result.length,
        wins: wins,
        losses: losses
      });
    });

  } else {
    res.sendFile(__dirname + "/public/login.html");
  }
});

app.get("/logout", function(req, res) {
  if(req.session.username) {
    req.session.destroy();
  }
  res.sendFile(__dirname + "/public/login.html");
});

let httpsServer = https.createServer({
  key: fs.readFileSync('sslcert/server.key'),
  cert: fs.readFileSync('sslcert/server.cert')
}, app).listen(port, function(){
  console.log("My https server listening on port " + port + "...");
});

/*let server = app.listen(port, function() {
  console.log("Server running");
});*/

//game related stuf (sockets - only for game.html)
var io = socket(httpsServer);

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.sockets.on("connection", newConnection);

let queue = [];

function newConnection(socket) {
  //console.log("someone connected");
  let p = new Player(socket, true);
  p.nickname = socket.request.session.username;

  console.log(p.nickname+" connected");

  if(queue.length > 0) { //two available players
    let lastPlayer = queue[0];
    queue.splice(0, 1);
    let g = new Game(lastPlayer, p);
    g.white.game = g;
    g.black.game = g;

    //emit ready message
    g.white.socket.emit("ready", {
      isWhite: true,
      opNickname: g.black.nickname
    })
    g.black.socket.emit("ready", {
      isWhite: false,
      opNickname: g.white.nickname
    });
  } else {
    queue.push(p);
    //p.socket.emit("wait", {});
  }

  socket.on("move", function(data) {
    p.broadcastMove(data);

  });
  socket.on("drawOffer", function() {
    let opp = p.isWhite ? p.game.black:p.game.white;
    opp.socket.emit("drawOffer", {});
  });
  socket.on("drawAccepted", function() {
    let opp = p.isWhite ? p.game.black : p.game.white;
    opp.socket.emit("drawAccepted", {});
    p.game.hasEnded = true;

    db.collection("games").insertOne({
      white: p.game.white.nickname,
      black: p.game.black.nickname,
      date: new Date(Date.now()).toISOString(),
      winner: "none",
      totalMoves: p.game.moves,
      endReason: "draw accepted"
    }, function(err, dat) {});
  });
  socket.on("drawDeclined", function() {
    let opp = p.isWhite ? p.game.black : p.game.white;
    opp.socket.emit("drawDeclined", {});
  });
  socket.on("resign", function(data) {
    if(p.game.hasEnded) return;
    let op = p.isWhite?p.game.black:p.game.white;
    op.socket.emit("resign", {});
    p.game.hasEnded = true;

    db.collection("games").insertOne({
      white: p.game.white.nickname,
      black: p.game.black.nickname,
      date: new Date(Date.now()).toISOString(),
      winner: p.isWhite ? p.game.black.nickname : p.game.white.nickname,
      totalMoves: p.game.moves,
      endReason: "resignation"
    }, function(err, dat) {});
  });
  socket.on("gameHasEnded", function(data) {
    if(p.game.hasEnded) return;
    p.game.hasEnded = true;

    let w;
    if(data.winner == "white") {
      w = p.game.white.nickname;
    } else if(data.winner == "black") {
      w = p.game.black.nickname;
    } else {
      w = "none";
    }
    //TODO record in the db the game
    db.collection("games").insertOne({
      white: p.game.white.nickname,
      black: p.game.black.nickname,
      date: new Date(Date.now()).toISOString(),
      winner: w,
      totalMoves: p.game.moves,
      endReason: data.reason
    }, function(err, dat) {});
  });
  socket.on("rematchProposal", function(data) {
    let op = p.isWhite ? p.game.black:p.game.white;
    if(op.searchingNewOpponent) {
      p.socket.emit("rematchDeclined", {});
    }
    op.socket.emit("rematchProposal", data);
  });
  socket.on("rematchDeclined", function() {
    let op = p.isWhite ? p.game.black:p.game.white;
    op.socket.emit("rematchDeclined", {});
  });
  socket.on("rematchAccepted", function() {
    let opp = p.isWhite ? p.game.black:p.game.white;
    opp.socket.emit("rematchAccepted", {});

    //change
    let op = p.isWhite ? p.game.black : p.game.white;
    let g = new Game(p, op);
    g.white.game = g;
    g.black.game = g;

    //emit ready message
    g.white.socket.emit("ready", {
      isWhite: true,
      opNickname: g.black.nickname
    })
    g.black.socket.emit("ready", {
      isWhite: false,
      opNickname: g.white.nickname
    });
  });
  socket.on("newOpponent", function() {
    let opp = p.isWhite ? p.game.black : p.game.white;
    let done = false;
    for(let i = 0; i < queue.length; i++) {
      if(opp.socket.id != queue[i].socket.id) {
        //play with this guy
        let o = queue[0];
        queue.splice(0, 1);
        let g = new Game(p, o);
        g.white.game = g;
        g.black.game = g;

        g.white.socket.emit("ready", {
          isWhite: true,
          opNickname: g.black.nickname
        })
        g.black.socket.emit("ready", {
          isWhite: false,
          opNickname: g.white.nickname
        });

        done = true;
      }
    }
    if(!done) {
      queue.push(p);
    }
  });
  socket.on("chat", function(data) {
    let opp = p.isWhite ? p.game.black : p.game.white;
    opp.socket.emit("chat", data);
  });
  socket.on("disconnect", function() {
    console.log("someone disconnected");
    if(p.game.hasEnded) return;
    p.disconnect();
    p.game.hasEnded = true;

    //TODO record in the db the game
    db.collection("games").insertOne({
      white: p.game.white.nickname,
      black: p.game.black.nickname,
      date: new Date(Date.now()).toISOString(),
      winner: p.isWhite ? p.game.black.nickname : p.game.white.nickname,
      totalMoves: p.game.moves,
      endReason: "disconnection"
    }, function(err, dat) {});
  });
}

function Player(socket, isWhite) {
  this.isWhite = isWhite;
  this.nickname = "emptyname";
  this.socket = socket;
  this.game = undefined;
  this.searchingNewOpponent = false;

  this.broadcastMove = function(data) {
    if(this.game.moves % 2 == 0) {
      this.game.black.socket.emit("move", data);
    } else {
      this.game.white.socket.emit("move", data);
    }
    this.game.moves++;
  }

  this.disconnect = function() {
    let op = this.isWhite ? this.game.black : this.game.white;
    op.socket.emit("opDisconnected", {});
  }
}

function Game(player1, player2) {
  let p1 = player1;
  let p2 = player2;
  this.moves = 0;
  this.white = p1;
  this.black = p2;
  this.hasEnded = false;

  if(Math.random() > .5) {
    this.white = p2;
    this.black = p1;
  }
  this.white.isWhite = true;
  this.black.isWhite = false;
}
