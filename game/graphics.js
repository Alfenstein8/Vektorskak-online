function DrawBoard() {
  rectMode(CORNER)
  var bevel = 50
  stroke(0)
  for (let i = 0; i < gameSettings.boardW; i++) {
    for (let j = 0; j < gameSettings.boardH; j++) {
      CellColor(i, j)

      var a = 0,
        b = 0,
        c = 0,
        d = 0
      if (i == 0 && j == 0) a = bevel
      else if (i == gameSettings.boardW - 1 && j == 0) b = bevel
      else if (i == gameSettings.boardW - 1 && j == gameSettings.boardH - 1) c = bevel
      else if (i == 0 && j == gameSettings.boardH - 1) d = bevel
      strokeWeight(size / 20)
      rect(i * unit, j * unit, unit, unit, a, b, c, d)
      let cordinate = CellToPixel(createVector(i, j))
      board[i][j].Shape(cordinate.x, cordinate.y)

      if (selected != undefined) {
        if (selected.CanMoveTo(i, j)) {
          if (selected.CheckIntersections(i, j)) MarkCell(i, j, MARKTYPE.willDie)
          //@Optimize - Only run CheckIntersections once (Even on drag)
          else MarkCell(i, j, MARKTYPE.wontDie)
        }
      }
    }
  }
}
function UpdateTurnUI() {
  let lineUpLeft, lineDownLeft, lineUpRight, lineDownRight
  lineUpLeft = select("#turnUp")
  lineDownLeft = select("#turnDown")
  lineUpRight = select("#rightTurnUp")
  lineDownRight = select("#rightTurnDown")
  let up = turn == 1

  if (team == 1) up = !up
  if (up) {
    lineUpLeft.style("background-color", gameSettings.teamColors[turn].color)
    lineUpRight.style("background-color", gameSettings.teamColors[turn].color)
    lineDownLeft.style("background-color", "grey")
    lineDownRight.style("background-color", "grey")
  } else {
    lineDownLeft.style("background-color", gameSettings.teamColors[turn].color)
    lineDownRight.style("background-color", gameSettings.teamColors[turn].color)
    lineUpLeft.style("background-color", "grey")
    lineUpRight.style("background-color", "grey")
  }
}
function UpdateTeamNames(colorize, first) {
  topTeamName.style("font-size", "30px")
  while (topTeamName.size().width > canvas.size().width) {
    let fontsize = window.getComputedStyle(document.getElementById("topTeamName")).getPropertyValue("font-size")
    topTeamName.style("font-size", fontsize.replace("px", "") - 2 + "px")
  }

  bottomTeamName.style("font-size", "30px")
  while (bottomTeamName.size().width > canvas.size().width) {
    let fontsize = window.getComputedStyle(document.getElementById("bottomTeamName")).getPropertyValue("font-size")
    bottomTeamName.style("font-size", fontsize.replace("px", "") - 2 + "px")
  }
  if (colorize == undefined || colorize) {
    if (team == 1) {
      if (!first) topTeamName.style("color", gameSettings.teamColors[2].color)
      bottomTeamName.style("color", gameSettings.teamColors[1].color)
    } else {
      if (!first) topTeamName.style("color", gameSettings.teamColors[1].color)
      bottomTeamName.style("color", gameSettings.teamColors[2].color)
    }
  }
}
function MarkCell(x, y, markType) {
  push()
  switch (markType) {
    case MARKTYPE.wontDie:
      fill("#ccc99b")
      strokeWeight(0)
      ellipse(x * unit + unit / 2, y * unit + unit / 2, markSize)
      break
    case MARKTYPE.willDie:
      stroke("#ccc99b")
      strokeWeight(3)
      line(
        x * unit - markSize / 2 + unit / 2,
        y * unit - markSize / 2 + unit / 2,
        x * unit + markSize / 2 + unit / 2,
        y * unit + markSize / 2 + unit / 2
      )
      line(
        x * unit - markSize / 2 + unit / 2,
        y * unit + markSize / 2 + unit / 2,
        x * unit + markSize / 2 + unit / 2,
        y * unit - markSize / 2 + unit / 2
      )
      break
  }
  pop()
}
function JointShape(x, y, size) {
  let posX = x * unit + unit / 2
  let posY = y * unit + unit / 2
  ellipse(posX, posY, size)
  //rectMode(CENTER)
  //rect(posX, posY, size, size, 5)
}
function CellColor(x, y) {
  if ((x + y) % 2 == 0) fill(checkerColor1)
  else fill(checkerColor2)
  for (let t = 0; t < teams.length; t++) {
    const team = teams[t]
    if (team.base(x, y)) fill(gameSettings.teamColors[t].base)
  }
  if (selected == 0 || selected == undefined) return

  if (selected.CanMoveTo(x, y)) {
    fill(selectColor)
  }
}
function DrawJointDragging() {
  const mouseCell = createVector((GetMousePos().x - unit / 2) / unit, (GetMousePos().y - unit / 2) / unit)
  strokeWeight(lineWidth)
  stroke(gameSettings.teamColors[selected.team].color)
  line(selected.head.pos.x * unit + unit / 2, selected.head.pos.y * unit + unit / 2, GetMousePos().x, GetMousePos().y)
  fill(gameSettings.teamColors[selected.team].color)
  strokeWeight(0)
  JointShape(mouseCell.x, mouseCell.y, jointSize)
}

function ShowText(_text, x, y) {
  push()
  translate(x, y)
  if (team == 1) rotate(PI)
  text(_text, 0, 0)
  pop()
}
