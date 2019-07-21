function Player(name, isWhite) {
  this.name = name;
  this.isWhite = isWhite;
  this.pieces = [];

  //create the pieces and add them to the this.pieces array
  //pawn
  let y = 6;
  if(!isWhite) y = 1;
  for(let i = 0; i < 8; i++) {
    let p = new Pawn(isWhite, i, y);
    this.pieces.push(p);
  }

  if(y == 6) {
    y++;
  } else {
    y--;
  }
  //rooks
  this.pieces.push(new Rook(isWhite, 0, y));
  this.pieces.push(new Rook(isWhite, 7, y));

  //knights
  this.pieces.push(new Knight(isWhite, 1, y));
  this.pieces.push(new Knight(isWhite, 6, y));

  //bishops
  this.pieces.push(new Bishop(isWhite, 2, y));
  this.pieces.push(new Bishop(isWhite, 5, y));

  //queen & king
  this.pieces.push(new Queen(isWhite, 3, y));
  this.pieces.push(new King(isWhite, 4, y));


  this.drawPieces = function() {
    for(let i = 0; i < this.pieces.length; i++) {
      this.pieces[i].draw();
    }
  }
}
