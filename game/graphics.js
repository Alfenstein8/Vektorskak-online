const boardBevel = 50
const selectColor = {
  light: "#FFFCC1",
  dark: "#ccc99b",
}
const tileColor = {
  light: "#ffffff",
  dark: "#d2d2d2",
}

function DrawBoard() {
  rectMode(CORNER)
  stroke(0)
  for (let i = 0; i < gameSettings.boardW; i++) {
    for (let j = 0; j < gameSettings.boardH; j++) {
      CellColor(i, j)

      var topLeftBevel = 0,
        topRightBevel = 0,
        bottomRightBevel = 0,
        bottomLeftBevel = 0
      if (i == 0 && j == 0) topLeftBevel = boardBevel
      else if (i == gameSettings.boardW - 1 && j == 0) topRightBevel = boardBevel
      else if (i == gameSettings.boardW - 1 && j == gameSettings.boardH - 1) bottomRightBevel = boardBevel
      else if (i == 0 && j == gameSettings.boardH - 1) bottomLeftBevel = boardBevel
      strokeWeight(size / 20)
      rect(i * unit, j * unit, unit, unit, topLeftBevel, topRightBevel, bottomRightBevel, bottomLeftBevel)
      let cordinate = CellToPixel(createVector(i, j))
      board[i][j].Shape(cordinate.x, cordinate.y)

      if (selected != undefined) {
        if (selected.CanMoveTo(i, j)) {
          if (selected.CheckIntersections(i, j)) MarkCell(i, j, MARKTYPE.willDie, selectColor.dark)
          //@Optimize - Only run CheckIntersections once (Even on drag)
          else MarkCell(i, j, MARKTYPE.wontDie, selectColor.dark)
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
    lineUpLeft.style("background-color", teamColors[turn].normal)
    lineUpRight.style("background-color", teamColors[turn].normal)
    lineDownLeft.style("background-color", "grey")
    lineDownRight.style("background-color", "grey")
  } else {
    lineDownLeft.style("background-color", teamColors[turn].normal)
    lineDownRight.style("background-color", teamColors[turn].normal)
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
      if (!first) topTeamName.style("color", teamColors[2].normal)
      bottomTeamName.style("color", teamColors[1].normal)
    } else {
      if (!first) topTeamName.style("color", teamColors[1].normal)
      bottomTeamName.style("color", teamColors[2].normal)
    }
  }
}
function MarkCell(x, y, markType, color) {
  push()
  switch (markType) {
    case MARKTYPE.wontDie:
      fill(color)
      strokeWeight(0)
      ellipse(x * unit + unit / 2, y * unit + unit / 2, markSize)
      break
    case MARKTYPE.willDie:
      stroke(color)
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
function JointShape(x, y, size, shape) {
  let posX = x * unit + unit / 2
  let posY = y * unit + unit / 2
  switch (shape) {
    case SHAPES.rectangle:
      rectMode(CENTER)
      rect(posX, posY, size, size, 5)
      break
    case SHAPES.diamond:
      quad(posX, posY + size / 2, posX + size / 2, posY, posX, posY - size / 2, posX - size / 2, posY)
      break
    default:
      ellipse(posX, posY, size)
  }
}
function CellColor(x, y) {
  if ((x + y) % 2 == 0) fill(tileColor.light)
  else fill(tileColor.dark)
  for (let t = 0; t < teams.length; t++) {
    const team = teams[t]
    if (team.base(x, y)) fill(teamColors[t].light)
  }
  if (selected == 0 || selected == undefined) return

  if (selected.CanMoveTo(x, y)) {
    fill(selectColor.light)
  }
}
function DrawJointDragging() {
  const mouseCell = createVector((GetMousePos().x - unit / 2) / unit, (GetMousePos().y - unit / 2) / unit)
  strokeWeight(lineWidth)
  stroke(teamColors[selected.team].normal)
  line(selected.head.pos.x * unit + unit / 2, selected.head.pos.y * unit + unit / 2, GetMousePos().x, GetMousePos().y)
  fill(teamColors[selected.team].normal)
  strokeWeight(0)
  JointShape(mouseCell.x, mouseCell.y, jointSize, teamShapes[selected.team])
}

function ShowText(_text, x, y) {
  push()
  translate(x, y)
  if (team == 1) rotate(PI)
  text(_text, 0, 0)
  pop()
}
