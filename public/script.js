let black, white;
let selectedTile;
let availableMoves, showingAvailableMoves;

let moveHistory = [];

let whiteTurn = true;

let blackBishopImg, blackKingImg, blackKnightImg, blackPawnImg, blackQueenImg, blackRookImg;
let whiteBishopImg, whiteKingImg, whiteKnightImg, whitePawnImg, whiteQueenImg, whiteRookImg;

let side, margin;
let prop = 0.6;

let socket;
let ready = false;

let myPlayer;

let turnIndicator, checkIndicator;

function preload() {
  blackBishopImg = loadImage("sprites/blackBishop.png");
  blackKingImg = loadImage("sprites/blackKing.png");
  blackKnightImg = loadImage("sprites/blackKnight.png");
  blackPawnImg = loadImage("sprites/blackPawn.png");
  blackQueenImg = loadImage("sprites/blackQueen.png");
  blackRookImg = loadImage("sprites/blackRook.png");
  whiteBishopImg = loadImage("sprites/whiteBishop.png");
  whiteKingImg = loadImage("sprites/whiteKing.png");
  whiteKnightImg = loadImage("sprites/whiteKnight.png");
  whitePawnImg = loadImage("sprites/whitePawn.png");
  whiteQueenImg = loadImage("sprites/whiteQueen.png");
  whiteRookImg = loadImage("sprites/whiteRook.png");
}

function setup() {
  let canvas = createCanvas(550, 550);
  canvas.parent("gameContainer");
  background(0);
  fill(255);
  textAlign(CENTER);
  text("Waiting for an opponent...", width/2, height/2);

  turnIndicator = document.getElementById("turnIndicator");
  checkIndicator = document.getElementById("checkIndicator");

  //let ip = prompt("Game server IP address?");
  ip = "localhost";

  socket = io.connect("http://"+ip+":3000");

  side = width/8;
  margin = side*(1-prop)/2;

  showingAvailableMoves = false;

  black = new Player("Blackie", false);
  white = new Player("Whitacker", true);

  //drawGame();
  socketSetup();
}

function draw() {}

function mouseClicked() {
  if(!ready) return;
  let t = getPointedTile();
  if(t) {
    if(selectedTile && t.x == selectedTile.x && t.y == selectedTile.y) {
      //unselect tile
      selectedTile = undefined;
      availableMoves = undefined;
      showingAvailableMoves = false;
    } else {
      if(showingAvailableMoves && availableMoves) {
        for(let i = 0; i < availableMoves.length; i++) {
          if(availableMoves[i].y == t.y && availableMoves[i].x == t.x) {
            let p = getPieceAt(selectedTile.x, selectedTile.y);

            whiteTurn = !whiteTurn;
            turnIndicator.style.backgroundColor = 'black';

            let msg = {
              oldX: selectedTile.x,
              oldY: selectedTile.y,
              newX: t.x,
              newY: t.y,
              capture: false,
              enPassant: false,
              castling: false,
              promotion: false,
              promotionType: undefined
            };

            //check for capture
            if(availableMoves[i].capture) {
              msg.capture = true;
              if(getPieceAt(t.x, t.y)) {
                //normal capture
                if(!p.isWhite) {
                  white.deletePieceAt(availableMoves[i].x, availableMoves[i].y);
                } else {
                  black.deletePieceAt(availableMoves[i].x, availableMoves[i].y);
                }
              } else {
                //en passant
                msg.enPassant = true;
                if(p.isWhite) {
                  black.deletePieceAt(t.x, t.y+1);
                } else {
                  white.deletePieceAt(t.x, t.y-1);
                }
              }
            }

            moveHistory.push({
              piece: p,
              oldX: p.x,
              oldY: p.y,
              newX: t.x,
              newY: t.y
            });

            if(availableMoves[i].castling) {
              msg.castling = true;
              availableMoves[i].castling.piece.x = availableMoves[i].castling.newX;
            }

            p.x = t.x;
            p.y = t.y;
            selectedTile = undefined;
            availableMoves = [];

            //promotion
            if(p.getName() == "Pawn") {
              if((p.isWhite && p.y == 0) || (!p.isWhite && p.y == 7)) {
                msg.promotion = true;
                let player = p.isWhite ? white : black;
                player.deletePieceAt(p.x, p.y);

                let ans = prompt("Pawn promotion (choose between queen, knight, rook or bishop):");
                ans = ans.toLowerCase().trim();
                let newPiece;
                if(ans[0] == 'q') {
                  msg.promotionType = "queen";
                  newPiece = new Queen(p.isWhite, p.x, p.y);
                } else if(ans[1] == 'k') {
                  msg.promotionType = "knight";
                  newPiece = new Knight(p.isWhite, p.x, p.y);
                } else if(ans[2] == 'r') {
                  msg.promotionType = "rook";
                  newPiece = new Rook(p.isWhite, p.x, p.y);
                } else {
                  msg.promotionType = "bishop";
                  newPiece = new Bishop(p.isWhite, p.x, p.y);
                }
                player.pieces.push(newPiece);
              }
            }

            checkForCheck();

            socket.emit("move", msg);

            drawGame();
            return;
          }
        }
      }
      let piece = getPieceAt(t.x, t.y);
      if(piece && whiteTurn == myPlayer.isWhite && whiteTurn == piece.isWhite) {
        selectedTile = t;
        availableMoves = piece.getAvailableMoves();
        removeCheckMoves(availableMoves, piece);
        showingAvailableMoves = true;
      }
    }
  }
  drawGame();
}

function checkForCheck() {
  //if(white.isInCheck()) console.log("white in check");
  //if(black.isInCheck()) console.log("black in check");
  if(myPlayer.isInCheck()) {
    checkIndicator.style.backgroundColor = "#c92a45";
  } else {
    checkIndicator.style.backgroundColor = "black";
  }
  let op = myPlayer.isWhite ? black : white;
  if(myPlayer.isInCheckMate()) alert("You lose!");
  if(op.isInCheckMate()) alert("You win!");
}

function socketSetup() {
  socket.on("ready", startGame);
  socket.on("move", receiveMove);
  socket.on("opDisconnected", opDisconnected);
}

function opDisconnected() {
  alert("The opponent disconnected, you win!");
  console.log("The opponent disconnected, you win!");
}

function startGame(data) {
  ready = true;
  myPlayer = data.isWhite ? white : black;

  turnIndicator.style.backgroundColor = myPlayer.isWhite?'#c98f2a':'black';

  drawGame();
  console.log("Game id: "+data.gameId);
}

function receiveMove(data) {
  whiteTurn = !whiteTurn;
  turnIndicator.style.backgroundColor = '#c98f2a';

  //apply changes
  if(data.capture) {
    if(!isFree(data.newX, data.newY)) {
      //normal capture
      let p = getPieceAt(data.newX, data.newY);
      let pl = p.isWhite ? white : black;
      pl.deletePieceAt(data.newX, data.newY);
    } else {
      //en passant
      if(myPlayer.isWhite) {
        myPlayer.deletePieceAt(data.newX, data.newY-1);
      } else {
        myPlayer.deletePieceAt(data.newX, data.newY+1);
      }
    }
  }
  let p = getPieceAt(data.oldX, data.oldY);
  p.x = data.newX;
  p.y = data.newY;
  if(data.castling) {
    let pl = p.isWhite ? white : black;
    if(pl.king.x > 4) {
      //castling to the right
      let r = getPieceAt(7, pl.king.y);
      r.x = pl.king.x-1;
    } else {
      //castling to the left
      let r = getPieceAt(0, pl.king.y);
      r.x = pl.king.x+1;
    }
  }

  let pl = p.isWhite ? white : black;
  if(data.promotion) {
    pl.deletePieceAt(p.x, p.y);
    let newPiece;
    if(data.promotionType == "queen") newPiece = new Queen(p.isWhite, p.x, p.y);
    if(data.promotionType == "knight") newPiece = new Knight(p.isWhite, p.x, p.y);
    if(data.promotionType == "rook") newPiece = new Rook(p.isWhite, p.x, p.y);
    if(data.promotionType == "bishop") newPiece = new Bishop(p.isWhite, p.x, p.y);
    pl.pieces.push(newPiece);
  }

  moveHistory.push({
    piece: p,
    oldX: data.oldX,
    oldY: data.oldY,
    newX: data.newX,
    newY: data.newY
  });

  checkForCheck();

  drawGame();
}

function drawGame() {
  drawBoard();
  white.drawPieces();
  black.drawPieces();
}

function drawBoard() {
  let size;
  size = width/8;
  for(let i = 0; i < 8; i++) {
    for(let j = 0; j < 8; j++) {
      if((i+j) % 2 == 0) {
        fill(255);
      } else {
        fill(100);
      }
      if(selectedTile) {
        if(myPlayer.isWhite) {
          if(i == selectedTile.y && j == selectedTile.x) {
            fill(50,100,255);
          }
        } else {
          if(i == 7-selectedTile.y && j == 7-selectedTile.x) {
            fill(50,100,255);
          }
        }
      }
      rect(j*size, i*size, size, size);
    }
  }
  if(availableMoves) {
    for(let i = 0; i < availableMoves.length; i++) {
      if(availableMoves[i].check) {
        fill(127, 127, 127, 190);
      } else if(availableMoves[i].capture) {
        fill(237, 93, 83, 190);
      } else {
        fill(83, 165, 237, 190);
      }
      if(myPlayer.isWhite) {
        rect(availableMoves[i].x*size, availableMoves[i].y*size, size, size);
      } else {
        rect((7-availableMoves[i].x)*size, (7-availableMoves[i].y)*size, size, size);
      }
    }
  }
}

function getPointedTile() {
  let x, y;
  if(mouseX < 0 || mouseX > width) return undefined;
  if(mouseY < 0 || mouseY > height) return undefined;

  x = Math.floor(8*mouseX/width);
  y = Math.floor(8*mouseY/height);

  if(!myPlayer.isWhite) {
    x = 7-x;
    y = 7-y;
  }

  return {x: x, y: y};
}

function getPieceAt(x, y) {
  for(let i = 0; i < white.pieces.length; i++) {
      if(white.pieces[i].x == x && white.pieces[i].y == y) {
        return white.pieces[i];
      }
  }

  for(let i = 0; i < black.pieces.length; i++) {
      if(black.pieces[i].x == x && black.pieces[i].y == y) {
        return black.pieces[i];
      }
  }

  return undefined;
}

function printBoard() { //in the console (for debugging)
  for(let i = 0; i < 8; i++) {
    let line = "";
    for(let j = 0; j < 8; j++) {
      let p = getPieceAt(j, i);
      let additional = "x";
      if(p) {
        additional = p.getAbrv();
      }
      line = line + " " + additional;
    }
    console.log(line + "      " + Math.random());
  }
}

function isFree(x, y) {
  return getPieceAt(x, y) == undefined;
}
