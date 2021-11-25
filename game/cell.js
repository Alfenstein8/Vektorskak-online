class Cell {
  constructor(x, y, moreMove) {
    this.content = []
    this.extraMovement = moreMove
    board[x][y] = this
  }
  Shape(x, y) {
    if (this.extraMovement == 0 || !gameSettings.specialCells) return
    textAlign(CENTER, CENTER)
    fill(0)
    textSize(unit / 2)
    text(this.extraMovement + gameSettings.defaultMove, x, y)
  }
}
