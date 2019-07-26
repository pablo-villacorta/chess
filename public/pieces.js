function Piece(isWhite, x, y) {
  this.x = x;
  this.y = y;
  this.isWhite = isWhite;

  this.getAvailableMoves = function() {
    return undefined;
  }

  this.hasBeenMoved = function() {
    for(let i = 0; i < moveHistory.length; i++) {
      if(moveHistory[i].piece == this) {
        return true;
      }
    }
    return false;
  }

  this.getAbrv = function() {
    if(this.isWhite) {
      return this.getName()[0];
    } else {
      return (this.getName()).toLowerCase()[0];
    }
  }
}

function Pawn(isWhite, x, y) {
  Piece.call(this, isWhite, x, y);

  this.draw = function() {
    if(myPlayer.isWhite) {
      image(this.isWhite ? whitePawnImg : blackPawnImg, this.x*side+margin, this.y*side+margin, side*prop, side*prop);
    } else {
      image(this.isWhite ? whitePawnImg : blackPawnImg, (7-this.x)*side+margin, (7-this.y)*side+margin, side*prop, side*prop);
    }
  };

  this.getAvailableMoves = function() {
    let am = [];
    if(this.isWhite) {
      if(this.y == 6) { //initial tile
        if(isFree(this.x, this.y-2)) {
          am.push({x:this.x, y:this.y-2, check:false, capture: false});
        }
      }
      if(isFree(this.x, this.y-1)) {
        am.push({x:this.x, y:this.y-1, check:false, capture: false});
      }
      if(!isFree(this.x-1, this.y-1)) {
        if(getPieceAt(this.x-1, this.y-1).isWhite != this.isWhite) {
          am.push({x: this.x-1, y: this.y-1, check: false, capture: true});
        }
      }
      if(!isFree(this.x+1, this.y-1)) {
        if(getPieceAt(this.x+1, this.y-1).isWhite != this.isWhite) {
          am.push({x: this.x+1, y: this.y-1, check: false, capture: true});
        }
      }

      //en passant
      if(this.y == 3) {
        if(!isFree(this.x+1, this.y)) {
          let move = moveHistory[moveHistory.length-1];
          if(move.piece == getPieceAt(this.x+1, this.y) && Math.abs(move.newY-move.oldY) == 2) {
            am.push({x: this.x+1, y: this.y-1, check: false, capture: true});
            console.log("yayy");
          }
        }
        if(!isFree(this.x-1, this.y)) {
          let move = moveHistory[moveHistory.length-1];
          if(move.piece == getPieceAt(this.x-1, this.y) && Math.abs(move.newY-move.oldY) == 2) {
            am.push({x: this.x-1, y: this.y-1, check: false, capture: true});
            console.log("yayy");
          }
        }
      }
    } else {
      if(this.y == 1) { //initial tile
        if(isFree(this.x, this.y+2)) {
          am.push({x:this.x, y:this.y+2, check:false, capture: false});
        }
      }
      if(isFree(this.x, this.y+1)) {
        am.push({x:this.x, y:this.y+1, check:false, capture: false});
      }
      if(!isFree(this.x-1, this.y+1)) {
        if(getPieceAt(this.x-1, this.y+1).isWhite != this.isWhite) {
          am.push({x: this.x-1, y: this.y+1, check: false, capture: true});
        }
      }
      if(!isFree(this.x+1, this.y+1)) {
        if(getPieceAt(this.x+1, this.y+1).isWhite != this.isWhite) {
          am.push({x: this.x+1, y: this.y+1, check: false, capture: true});
        }
      }

      //en passant
      if(this.y == 4) {
        if(!isFree(this.x+1, this.y)) {
          let move = moveHistory[moveHistory.length-1];
          if(move.piece == getPieceAt(this.x+1, this.y) && Math.abs(move.newY-move.oldY) == 2) {
            am.push({x: this.x+1, y: this.y+1, check: false, capture: true});
            console.log("yayy");
          }
        }
        if(!isFree(this.x-1, this.y)) {
          let move = moveHistory[moveHistory.length-1];
          if(move.piece == getPieceAt(this.x-1, this.y) && Math.abs(move.newY-move.oldY) == 2) {
            am.push({x: this.x-1, y: this.y+1, check: false, capture: true});
            console.log("yayy");
          }
        }
      }
    }

    return am;
  }
}

function Rook(isWhite, x, y) {
  Piece.call(this, isWhite, x, y);

  this.draw = function() {
    if(myPlayer.isWhite) {
      image(this.isWhite ? whiteRookImg : blackRookImg, this.x*side+margin, this.y*side+margin, side*prop, side*prop);
    } else {
      image(this.isWhite ? whiteRookImg : blackRookImg, (7-this.x)*side+margin, (7-this.y)*side+margin, side*prop, side*prop);
    }
  };

  this.getAvailableMoves = function() {
    let am = [];
    addOrtogonalMoves(am, this);
    return am;
  }
}

function Knight(isWhite, x, y) {
  Piece.call(this, isWhite, x, y);

  this.draw = function() {
    if(myPlayer.isWhite) {
      image(this.isWhite ? whiteKnightImg : blackKnightImg, this.x*side+margin, this.y*side+margin, side*prop, side*prop);
    } else {
      image(this.isWhite ? whiteKnightImg : blackKnightImg, (7-this.x)*side+margin, (7-this.y)*side+margin, side*prop, side*prop);
    }
  };

  this.getAvailableMoves = function() {
    let am = [];

    let p = [
      {x: this.x+1, y: this.y-2},
      {x: this.x+2, y: this.y-1},
      {x: this.x+2, y: this.y+1},
      {x: this.x+1, y: this.y+2},
      {x: this.x-1, y: this.y+2},
      {x: this.x-2, y: this.y+1},
      {x: this.x-2, y: this.y-1},
      {x: this.x-1, y: this.y-2}
    ];

    for(let i = 0; i < p.length; i++) {
      if(p[i].x >= 0 && p[i].x < 8) {
        if(p[i].y >= 0 && p[i].y < 8) {
          if(isFree(p[i].x, p[i].y)) {
            am.push({x: p[i].x, y: p[i].y, check: false, capture: false});
          } else if(getPieceAt(p[i].x, p[i].y).isWhite != this.isWhite) {
            //opponent's piece
            am.push({x: p[i].x, y: p[i].y, check: false, capture: true});
          }
        }
      }
    }

    return am;
  }
}

function Bishop(isWhite, x, y) {
  Piece.call(this, isWhite, x, y);

  this.draw = function() {
    if(myPlayer.isWhite) {
      image(this.isWhite ? whiteBishopImg : blackBishopImg, this.x*side+margin, this.y*side+margin, side*prop, side*prop);
    } else {
      image(this.isWhite ? whiteBishopImg : blackBishopImg, (7-this.x)*side+margin, (7-this.y)*side+margin, side*prop, side*prop);
    }
  };

  this.getAvailableMoves = function() {
    let am = [];
    addDiagonalMoves(am, this);
    return am;
  }
}

function Queen(isWhite, x, y) {
  Piece.call(this, isWhite, x, y);

  this.draw = function() {
    if(myPlayer.isWhite) {
      image(this.isWhite ? whiteQueenImg : blackQueenImg, this.x*side+margin, this.y*side+margin, side*prop, side*prop);
    } else {
      image(this.isWhite ? whiteQueenImg : blackQueenImg, (7-this.x)*side+margin, (7-this.y)*side+margin, side*prop, side*prop);
    }
  };

  this.getAvailableMoves = function() {
    let am = [];
    addOrtogonalMoves(am, this);
    addDiagonalMoves(am, this);
    return am;
  }
}

function King(isWhite, x, y) {
  Piece.call(this, isWhite, x, y);

  this.draw = function() {
    if(myPlayer.isWhite) {
      image(this.isWhite ? whiteKingImg : blackKingImg, this.x*side+margin, this.y*side+margin, side*prop, side*prop);
    } else {
      image(this.isWhite ? whiteKingImg : blackKingImg, (7-this.x)*side+margin, (7-this.y)*side+margin, side*prop, side*prop);
    }
  };

  this.getAvailableMoves = function(ignoreCastling) {
    let am = [];

    let p = [
      {x: this.x-1, y: this.y},
      {x: this.x-1, y: this.y-1},
      {x: this.x, y: this.y-1},
      {x: this.x+1, y: this.y-1},
      {x: this.x+1, y: this.y},
      {x: this.x+1, y: this.y+1},
      {x: this.x, y: this.y+1},
      {x: this.x - 1, y: this.y+1}
    ];

    for(let i = 0; i < p.length; i++) {
      if(p[i].x >= 0 && p[i].x < 8) {
        if(p[i].y >= 0 && p[i].y < 8) {
          if(isFree(p[i].x, p[i].y)) {
            am.push({x: p[i].x, y: p[i].y, check: false, capture: false});
          } else if (getPieceAt(p[i].x, p[i].y).isWhite != this.isWhite) {
            //opponent's piece
            am.push({x: p[i].x, y: p[i].y, check: false, capture: true});
          }
        }
      }
    }

    if(ignoreCastling) return am;

    //castling
    if(!this.hasBeenMoved()) {
      if(this.isWhite) {
        //to the right
        if(isFree(this.x+1, this.y) && isFree(this.x+2, this.y) && !isFree(7,7)) {
          let limitationByCheck = false;
          let origX = this.x;
          for(let k = 0; k < 3; k++) {
            this.x = origX + k;
            if(white.isInCheck()) {
              limitationByCheck = true;
              break;
            }
          }
          this.x = origX;
          if(!limitationByCheck) {
            if(!getPieceAt(7,7).hasBeenMoved()) {
              am.push({x: this.x+2, y: this.y, check: false, capture: false, castling: {
                piece: getPieceAt(7,7),
                newX: this.x+1
              }});
            }
          }
        }

        //to the left
        if(isFree(this.x-1, this.y) && isFree(this.x-2, this.y) && isFree(this.x-3, this.y) && !isFree(0,7)) {
          let limitationByCheck = false;
          let origX = this.x;
          for(let k = 0; k < 3; k++) {
            this.x = origX - k;
            if(white.isInCheck()) {
              limitationByCheck = true;
              break;
            }
          }
          this.x = origX;
          if(!limitationByCheck) {
            if(!getPieceAt(0,7).hasBeenMoved()) {
              am.push({x: this.x-2, y: this.y, check: false, capture: false, castling: {
                piece: getPieceAt(0,7),
                newX: this.x-1
              }});
            }
          }
        }
      } else { //isBlack
        //to the right
        if(isFree(this.x+1, this.y) && isFree(this.x+2, this.y) && !isFree(7,0)) {
          let limitationByCheck = false;
          let origX = this.x;
          for(let k = 0; k < 3; k++) {
            this.x = origX + k;
            if(black.isInCheck()) {
              limitationByCheck = true;
              break;
            }
          }
          this.x = origX;
          if(!limitationByCheck) {
            if(!getPieceAt(7,0).hasBeenMoved()) {
              am.push({x: this.x+2, y: this.y, check: false, capture: false, castling: {
                piece: getPieceAt(7,0),
                newX: this.x+1
              }});
            }
          }
        }

        //to the left
        if(isFree(this.x-1, this.y) && isFree(this.x-2, this.y) && isFree(this.x-3, this.y) && !isFree(0,0)) {
          let limitationByCheck = false;
          let origX = this.x;
          for(let k = 0; k < 3; k++) {
            this.x = origX - k;
            if(black.isInCheck()) {
              limitationByCheck = true;
              break;
            }
          }
          this.x = origX;
          if(!limitationByCheck) {
            if(!getPieceAt(0,0).hasBeenMoved()) {
              am.push({x: this.x-2, y: this.y, check: false, capture: false, castling: {
                piece: getPieceAt(0,0),
                newX: this.x-1
              }});
            }
          }
        }
      }
    }

    return am;
  }
}

function removeCheckMoves(am, p) { //am = availableMoves list
  let player = black;
  let op = white;
  if(p.isWhite) {
    player = white;
    op = black;
  }

  let xy = {
    x: p.x,
    y: p.y
  };

  for(let i = am.length-1; i >= 0; i--) {
    let cap;
    if(am[i].capture) {
      cap = getPieceAt(am[i].x, am[i].y);
      op.deletePieceAt(am[i].x, am[i].y);
    }

    p.x = am[i].x;
    p.y = am[i].y;

    if(player.isInCheck()) {
      am.splice(i, 1);
    }

    p.x = xy.x;
    p.y = xy.y;

    if(cap) {
      op.pieces.push(cap);
    }
  }
}

function addOrtogonalMoves(am, piece) { //am = availableMoves list
  //up
  for(let i = piece.y-1; i >= 0; i--) {
    if(isFree(piece.x, i)) {
      am.push({x: piece.x, y: i, check: false, capture: false});
    } else {
      if(getPieceAt(piece.x, i).isWhite != piece.isWhite) {
        //opponent's piece
        am.push({x: piece.x, y: i, check: false, capture: true});
      }
      break;
    }
  }

  //down
  for(let i = piece.y+1; i < 8; i++) {
    if(isFree(piece.x, i)) {
      am.push({x: piece.x, y: i, check: false, capture: false});
    } else {
      if(getPieceAt(piece.x, i).isWhite != piece.isWhite) {
        //opponent's piece
        am.push({x: piece.x, y: i, check: false, capture: true});
      }
      break;
    }
  }

  //left
  for(let i = piece.x-1; i >= 0; i--) {
    if(isFree(i, piece.y)) {
      am.push({x: i, y: piece.y, check: false, capture: false});
    } else {
      if(getPieceAt(i, piece.y).isWhite != piece.isWhite) {
        //opponent's piece
        am.push({x: i, y: piece.y, check: false, capture: true});
      }
      break;
    }
  }

  //right
  for(let i = piece.x+1; i < 8; i++) {
    if(isFree(i, piece.y)) {
      am.push({x: i, y: piece.y, check: false, capture: false});
    } else {
      if(getPieceAt(i, piece.y).isWhite != piece.isWhite) {
        //opponent's piece
        am.push({x: i, y: piece.y, check: false, capture: true});
      }
      break;
    }
  }
}

function addDiagonalMoves(am, piece) { //am = availableMoves list
  //top left
  for(let i = 1; i < 8; i++) {
    if(piece.x-i >= 0 && piece.y-1 >= 0) {
      if(isFree(piece.x-i, piece.y-i)) {
        am.push({x: piece.x-i, y: piece.y-i, check: false, capture: false});
      } else {
        if(getPieceAt(piece.x-i, piece.y-i).isWhite != piece.isWhite) {
          //opponent's piece
          am.push({x: piece.x-i, y: piece.y-i, check: false, capture: true});
        }
        break;
      }
    }
  }

  //top right
  for(let i = 1; i < 8; i++) {
    if(piece.x+i >= 0 && piece.y-i >= 0) {
      if(isFree(piece.x+i, piece.y-i)) {
        am.push({x: piece.x+i, y: piece.y-i, check: false, capture: false});
      } else {
        if(getPieceAt(piece.x+i, piece.y-i).isWhite != piece.isWhite) {
          //opponent's piece
          am.push({x: piece.x+i, y: piece.y-i, check: false, capture: true});
        }
        break;
      }
    }
  }

  //down left
  for(let i = 1; i < 8; i++) {
    if(piece.x-i >= 0 && piece.y+i >= 0) {
      if(isFree(piece.x-i, piece.y+i)) {
        am.push({x: piece.x-i, y: piece.y+i, check: false, capture: false});
      } else {
        if(getPieceAt(piece.x-i, piece.y+i).isWhite != piece.isWhite) {
          //opponent's piece
          am.push({x: piece.x-i, y: piece.y+i, check: false, capture: true});
        }
        break;
      }
    }
  }

  //down right
  for(let i = 1; i < 8; i++) {
    if(piece.x+i >= 0 && piece.y+i >= 0) {
      if(isFree(piece.x+i, piece.y+i)) {
        am.push({x: piece.x+i, y: piece.y+i, check: false, capture: false});
      } else {
        if(getPieceAt(piece.x+i, piece.y+i).isWhite != piece.isWhite) {
          //opponent's piece
          am.push({x: piece.x+i, y: piece.y+i, check: false, capture: true});
        }
        break;
      }
    }
  }
}

Object.prototype.getName = function() {
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((this).constructor.toString());
   return (results && results.length > 1) ? results[1] : "";
};
