class Cell {
  constructor(x, y, moreMove) {
    this.content = []
    this.extraMovement = moreMove
    board[x][y] = this
  }
  Shape(x, y) {
    if (this.extraMovement == 0 || !specialCells) return
    textAlign(CENTER, CENTER)
    fill(0)
    textSize(unit / 2)
    text(this.extraMovement + defaultMove, x, y)
  }
}
