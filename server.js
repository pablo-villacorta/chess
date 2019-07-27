var express = require('express');
const cors = require('cors');
var socket = require('socket.io');

var app = express();
var server = app.listen(3000);

app.use(cors());
app.options('*', cors());

app.use(express.static('public'));
console.log("server running!");

var io = socket(server);
io.sockets.on("connection", newConnection);

let lastPlayer;
let games = [];

function newConnection(socket) {
  console.log("someone connected");
  let p = new Player(socket, true);
  if(lastPlayer) { //two available players
    games.push(new Game(lastPlayer, p));
    let g = games[games.length-1];
    g.white.game = g;
    g.black.game = g;

    //emit ready message
    g.white.socket.emit("ready", {
      isWhite: true,
      gameId: games.length-1
    })
    g.black.socket.emit("ready", {
      isWhite: false,
      gameId: games.length-1
    });

    lastPlayer = undefined;
  } else {
    lastPlayer = p;
    //emit waiting message
    p.socket.emit("wait", {});
  }
  socket.on("move", function(data) {
    p.broadcastMove(data);
  });
  socket.on("disconnect", function() {
    console.log("someone disconnected");
    p.disconnect();
  });
}

function Player(socket, isWhite) {
  this.isWhite = isWhite;
  this.socket = socket;
  this.game = undefined;

  this.broadcastMove = function(data) {
    if(this.game.moves % 2 == 0) {
      this.game.black.socket.emit("move", data);
    } else {
      this.game.white.socket.emit("move", data);
    }
    this.game.moves++;
  }

  this.disconnect = function() {
    console.log("games: "+games.length);
    if(games.length == 0) return;
    if(this.game.white.socket.id == this.socket.id || this.game.black.socket.id == this.socket.id) {
      console.log("first player to leave");
      let op = this.isWhite ? this.game.black : this.game.white;
      op.socket.emit("opDisconnected", {});
      games.splice(this.game.getPos(), 1);
    } else {
      console.log("second player to leave");
    }
  }
}

function Game(player1, player2) {
  let p1 = player1;
  let p2 = player2;
  this.moves = 0;
  this.white = p1;
  this.black = p2;
  if(Math.random() > .5) {
    this.white = p2;
    this.black = p1;
  }
  this.white.isWhite = true;
  this.black.isWhite = false;

  this.getPos = function() {
    for(let i = 0; i < games.length; i++) {
      if(games[i] == this) return i;
    }
    return -1;
  }
}
