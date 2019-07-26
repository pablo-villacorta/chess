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
    g.white.gameID = games.length-1;
    g.black.gameID = games.length-1;

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
    lastPlayer = new Player(p.socket, p.isWhite);
    //emit waiting message
    p.socket.emit("wait", {});
  }
  socket.on("move", function(data) {
    p.broadcastMove(data);
  });
}

function Player(socket, isWhite) {
  this.isWhite = isWhite;
  this.socket = socket;
  this.gameID = games.length;

  this.broadcastMove = function(data) {
    console.log(games[this.gameID].moves+" moves in total");
    if(games[this.gameID].moves % 2 == 0) {
      games[this.gameID].black.socket.emit("move", data);
    } else {
      games[this.gameID].white.socket.emit("move", data);
    }
    games[this.gameID].moves++;
  }
}

function Game(player1, player2) {
  let p1 = new Player(player1.socket, player1.isWhite);
  let p2 = new Player(player2.socket, player2.isWhite);
  this.moves = 0;
  this.white = p1;
  this.black = p2;
  if(Math.random() > .5) { //randomly assign colors
    this.white = p2;
    this.black = p1;
  }
  this.white.isWhite = true;
  this.black.isWhite = false;
}
