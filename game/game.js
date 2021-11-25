var canvas
const boardSize = 20
var size = window.innerHeight / boardSize
var board = []
//#region appearance
var checkerColor1 = 255,
  checkerColor2 = 210

var lineWidth = 10
var jointSize = size / 1.25
var selectColor = "#FFFCC1"
//#endregion

var unit
var teams = []
var team = undefined
var selected = undefined
var possibleMoves = []
var aliveChains = []
var deadChains = []
var dragging = false
var winner = undefined
var localPlay = false
//callings
var display = true
var sortChains = true
var checkWin = false
//#region firebase
var gameID = undefined
var connected = false
var gameLog = []
var connectedPlayers = {}
var user
var startLog
var moveKey = undefined
var turn = 1
var gameSettings = defaultGameSettings

//#region
function GameSetup() {
  aliveChains = []
  deadChains = []

  document.getElementById("gameCode").innerHTML = gameID
  localPlay = gameID == "local"
  if (localPlay) {
    team = -1
    connected = true
    ReadySetup()
    return
  }
  if (gameID.length != 6) document.getElementById("gameCode").innerHTML = "Game does not exist"

  let name = user.displayName
  if (name == null) {
    name = generate_badass_gamertag()
    user.updateProfile({ displayName: name })
  }

  GetGameSettings(gameID, (_settings) => {
    if (_settings != undefined) {
      gameSettings = _settings
      JoinGame(gameID, user).then((t) => {
        team = t
        document.getElementById("team").innerHTML = "You are " + (team == 0 ? "a spectator" : "team: " + team)
        document.getElementById("team").style.color = gameSettings.teamColors[team].color
        document.getElementById("turn").innerHTML = team == 1 ? "Your turn" : "Their turn"
        connected = true
        ReadySetup()
      })
      PlayerJoined(gameID, (player) => {
        let child = createDiv('<h2 id="user">' + player.val().username + "</h2>")
        select("#users").child(child)
        connectedPlayers[player.key] = {
          user: player,
          element: child,
        }
        child.style("color", gameSettings.teamColors[player.val().team].color)
      })

      PlayerLeft(gameID, (player) => {
        if (player.key == user.uid) JoinGame(gameID, user, team)

        connectedPlayers[player.key].element.remove()
        delete connectedPlayers[player.key]
      })
    } else {
      document.getElementById("gameCode").innerHTML = "Game does not exist"
    }
  })
}
function ReadySetup() {
  canvas = createCanvas(gameSettings.boardW * size, gameSettings.boardH * size)
  canvas.parent("gamepage")
  FormatteamColors()

  selectColor = color(selectColor)
  unit = canvas.width / gameSettings.boardW
  for (let i = 0; i < gameSettings.boardW; i++) {
    board[i] = new Array(gameSettings.boardH)
  }
  for (let i = 0; i < 3; i++) {
    teams[i] = {
      chains: [],
      base: function (x, y) {
        return false
      },
    }
  }
  teams[1].base = function (x, y) {
    return y == 0
  }
  teams[2].base = function (x, y) {
    return y == gameSettings.boardH - 1
  }

  BoardSetup()
  SetCanvas()
  if (localPlay) return
  LogAdded(gameID, (log, logID) => {
    gameLog.push(log)
    ApplyMoveFromLog(log, logID)
    document.getElementById("turn").innerHTML = turn == team ? "Your turn" : "Their turn"
  })
}
function ApplyMoveFromLog(log, logKey) {
  let joint = UpperJoint(log.from.x, log.from.y)
  if (joint == undefined || joint.chain.head != joint) {
    document.getElementById("gameCode").innerHTML = "Something went wrong. Refresh or make a new game"
  } else if (moveKey != logKey || localPlay) {
    joint.chain.Move(log.to.x, log.to.y, false) //"false" is important
  }
  turn = log.team == teams.length - 1 ? 1 : turn + 1
}

function FormatteamColors() {
  for (let i = 0; i < gameSettings.teamColors.length; i++) {
    const keys = Object.keys(gameSettings.teamColors[i])
    const values = Object.values(gameSettings.teamColors[i])
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j]
      gameSettings.teamColors[i][key] = values[j]
    }
  }
}
function BoardSetup() {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      var move = 0
      if (x == int(gameSettings.boardW / 2) && y == int(gameSettings.boardH / 2)) move = 1
      new Cell(x, y, move)
    }
  }
  //team 1
  gameSettings.setup.forEach((chain) => {
    new Chain(chain.x, chain.y, chain.team)
  })
}
var ro = new ResizeObserver((entries) => {
  SetCanvas()
})
ro.observe(document.body)
function SetCanvas() {
  if (canvas == undefined) return
  size = window.innerHeight / boardSize
  try {
    canvas.resize(gameSettings.boardW * size, gameSettings.boardH * size)
    canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2)
    unit = canvas.width / gameSettings.boardW
    jointSize = size / 1.25
    Display()
  } catch (error) {}
}
function draw() {
  if (!connected) return
  if (checkWin) {
    CheckWin()
    checkWin = false
  }
  if (display) {
    Display()
    display = false
  }
  if (winner != undefined) {
    let index = teams.indexOf(winner)
    stroke(0)
    strokeWeight(1)
    textAlign(CENTER, CENTER)
    textSize(unit * 1)
    fill(gameSettings.teamColors[index].color)
    text("Player " + index + " wins", width / 2, height / 2)
  }
}
function Display() {
  if (!connected) return
  background(255, 255, 255, 0)
  DrawBoard()

  deadChains.forEach((chain) => {
    chain.Draw()
  })
  aliveChains.forEach((chain) => {
    chain.Draw()
  })
}
function DrawJointDragging() {
  const mouseCell = createVector((mouseX - unit / 2) / unit, (mouseY - unit / 2) / unit)
  strokeWeight(lineWidth)
  stroke(gameSettings.teamColors[selected.team].color)
  line(selected.head.pos.x * unit + unit / 2, selected.head.pos.y * unit + unit / 2, mouseX, mouseY)
  fill(gameSettings.teamColors[selected.team].color)
  strokeWeight(0)
  JointShape(mouseCell.x, mouseCell.y, jointSize)
}

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
      strokeWeight(2)
      rect(i * unit, j * unit, unit, unit, a, b, c, d)
      let cordinate = CellToPixel(createVector(i, j))
      board[i][j].Shape(cordinate.x, cordinate.y)
    }
  }
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
function mouseDragged() {
  if (winner != undefined || !connected) return
  if (selected != undefined) {
    Display()
    DrawJointDragging()
  }
}
function mousePressed() {
  if (winner != undefined || !connected) return
  if (mouseX < 0 || mouseY < 0 || mouseX > gameSettings.boardW * unit || mouseY > gameSettings.boardH * unit) return

  let joint = UpperJoint(int(mouseX / unit), int(mouseY / unit))
  if (joint != undefined && joint.chain.team == turn && joint == joint.chain.head && (team == -1 || turn === team)) {
    selected = selected == undefined ? joint.chain : undefined
  }

  display = true
}
function mouseReleased() {
  if (!connected) return
  display = true
  if (mouseX < 0 || mouseY < 0 || mouseX > gameSettings.boardW * unit || mouseY > gameSettings.boardH * unit) return
  if (selected == undefined || selected.head == UpperJoint(int(mouseX / unit), int(mouseY / unit))) return
  selected.Move(int(mouseX / unit), int(mouseY / unit))
  selected = undefined
}

function UpperJoint(x, y) {
  let cell = board[x][y]
  if (cell == undefined || x < 0 || y < 0) return undefined
  for (let i = cell.content.length - 1; i >= 0; i--) {
    const item = cell.content[i]
    if (item.chain != undefined) {
      if (!item.chain.dead) return item
    }
  }
  return undefined
}
function JointShape(x, y, size) {
  let posX = x * unit + unit / 2
  let posY = y * unit + unit / 2
  ellipse(posX, posY, size)
  //rectMode(CENTER)
  //rect(posX, posY, size, size, 5)
}
function IsLinesIntersecting(a, b, c, d) {
  var det, gamma, lambda
  det = (b.y - a.y) * (d.x - c.x) - (d.y - c.y) * (b.x - a.x)
  if (PointLineIntersection(b, c, d) < 0.1) return true
  if (det === 0) {
    return false
  } else {
    lambda = ((d.x - c.x) * (d.y - a.y) + (c.y - d.y) * (d.x - a.x)) / det
    gamma = ((a.x - b.x) * (d.y - a.y) + (b.y - a.y) * (d.x - a.x)) / det
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1
  }
}
function PointLineIntersection(a, b, c) {
  var d = a.x - b.x
  var e = a.y - b.y
  var bDis = Math.sqrt(d * d + e * e)

  d = a.x - c.x
  e = a.y - c.y
  var cDis = Math.sqrt(d * d + e * e)

  d = b.x - c.x
  e = b.y - c.y
  var lineDis = Math.sqrt(d * d + e * e)

  if (bDis * bDis > cDis * cDis + lineDis * lineDis) return bDis
  else if (cDis * cDis > bDis * bDis + lineDis * lineDis) return cDis
  else {
    var s = (bDis + cDis + lineDis) / 2
    return (2 / lineDis) * sqrt(s * (s - bDis) * (s - cDis) * (s - lineDis))
  }
}
function CheckWin() {
  let winnerFound = false
  if (gameSettings.deathWin) {
    let playingTeams = []
    teams.forEach((team) => {
      for (let i = 0; i < team.chains.length; i++) {
        const chain = team.chains[i]
        if (!chain.dead) {
          playingTeams.push(team)
          break
        }
      }
    })
    if (playingTeams.length == 1) {
      Win(playingTeams[0])
      winnerFound = true
    }
  }
  if (winnerFound) return
  if (gameSettings.baseWin) {
    for (let t = 0; t < teams.length; t++) {
      const team = teams[t]
      for (let h = 0; h < team.chains.length; h++) {
        const head = team.chains[h].head
        for (let o = 0; o < teams.length; o++) {
          const otherTeam = teams[o]
          if (team != otherTeam) {
            if (otherTeam.base(head.pos.x, head.pos.y)) {
              Win(team)
              return
            }
          }
        }
      }
    }
  }
}
function Win(team) {
  console.log("team " + teams.indexOf(team) + " wins")
  winner = team
}

function CellToPixel(cell) {
  var result = createVector(cell.x * unit + unit / 2, cell.y * unit + unit / 2)
  return result
}
function PixelToCell(pos) {
  let result = createVector(floor(pos.x / unit), floor(pos.y / unit))
  return result
}
