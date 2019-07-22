let black, white;
let selectedTile;
let availableMoves, showingAvailableMoves;

let moveHistory = [];

function setup() {
  createCanvas(550, 550);
  background(0);

  showingAvailableMoves = false;

  black = new Player("Blackie", false);
  white = new Player("Whitacker", true);

  drawGame();
}

function draw() {}

function mouseClicked() {
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

            //check for capture
            if(availableMoves[i].capture) {
              if(getPieceAt(t.x, t.y)) {
                //normal capture
                if(!p.isWhite) {
                  white.deletePieceAt(availableMoves[i].x, availableMoves[i].y);
                } else {
                  black.deletePieceAt(availableMoves[i].x, availableMoves[i].y);
                }
              } else {
                //en passant
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
                availableMoves[i].castling.piece.x = availableMoves[i].castling.newX;
            }

            p.x = t.x;
            p.y = t.y;
            selectedTile = undefined;
            availableMoves = [];

            console.log("white in check: "+white.isInCheck());
            console.log("black in check: "+black.isInCheck());

            drawGame();
            return;
          }
        }
      }
      let piece = getPieceAt(t.x, t.y);
      if(piece) {
        selectedTile = t;
        availableMoves = piece.getAvailableMoves();
        showingAvailableMoves = true;
      }
    }
  }
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
        fill(0);
      }
      if(selectedTile) {
        if(i == selectedTile.y && j == selectedTile.x) {
          fill(50,100,255);
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
      rect(availableMoves[i].x*size, availableMoves[i].y*size, size, size);
    }
  }
}

function getPointedTile() {
  let x, y;
  if(mouseX < 0 || mouseX > width) return undefined;
  if(mouseY < 0 || mouseY > height) return undefined;

  x = Math.floor(8*mouseX/width);
  y = Math.floor(8*mouseY/height);

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

function isFree(x, y) {
  return getPieceAt(x, y) == undefined;
}
