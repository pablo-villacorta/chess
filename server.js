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

let queue = [];

function newConnection(socket) {
  //console.log("someone connected");
  let p = new Player(socket, true);

  socket.on("nickname", function(data) {
    p.nickname = data.nickname;
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
  });
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
  });
  socket.on("gameHasEnded", function(data) {
    p.game.hasEnded = true;
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
      isWhite: true
    })
    g.black.socket.emit("ready", {
      isWhite: false
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
          isWhite: true
        })
        g.black.socket.emit("ready", {
          isWhite: false
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
