function Piece(isWhite, x, y) {
  this.x = x;
  this.y = y;
  this.isWhite = isWhite;

  this.moveHistory = [];
  /**
  {
    moveId: ,
    oldX: ,
    oldY: ,
    newX: ,
    newY:
  }
  */

  this.recordMove = function(newX, newY) {
    this.moveHistory.push({
      moveId: numberOfMoves,
      oldX: this.x,
      oldY: this.y,
      newX: newX,
      newY: newY,
    });
  }

  this.getAvailableMoves = function() {
    return undefined;
  }
}

function Pawn(isWhite, x, y) {
  Piece.call(this, isWhite, x, y);

  this.draw = function() {
    let side = width/8;
    chooseColor(this.isWhite);
    textAlign(CENTER);
    text("Pawn", this.x*side + side/2, this.y*side+side/2);
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
    }

    return am;
  }
}

function Rook(isWhite, x, y) {
  Piece.call(this, isWhite, x, y);

  this.draw = function() {
    let side = width/8;
    chooseColor(this.isWhite);
    textAlign(CENTER);
    text("Rook", this.x*side + side/2, this.y*side+side/2);
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
    let side = width/8;
    chooseColor(this.isWhite);
    textAlign(CENTER);
    text("Knight", this.x*side + side/2, this.y*side+side/2);
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
    let side = width/8;
    chooseColor(this.isWhite);
    textAlign(CENTER);
    text("Bishop", this.x*side + side/2, this.y*side+side/2);
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
    let side = width/8;
    chooseColor(this.isWhite);
    textAlign(CENTER);
    text("Queen", this.x*side + side/2, this.y*side+side/2);
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
    let side = width/8;
    chooseColor(this.isWhite);
    textAlign(CENTER);
    text("King", this.x*side + side/2, this.y*side+side/2);
  };

  this.getAvailableMoves = function() {
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

    return am;
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

function chooseColor(isWhite) {
  if(isWhite) {
    fill(255,0,0);
  } else {
    fill(0,180,0);
  }
}
