var canvas
var boardW = 9,
  boardH = 15
const boardSize = 20
var size = window.innerHeight / boardSize
var board = []
//#region appearance
var teamColors = [
  {
    // color: "#36393F",
    // base: "#777E8B",
    // dead: "#565B65",
    // head: "#0A0A0C",
    color: "#FFFFFF",
    base: "#FFFFFF",
    dead: "#FFFFFF",
    head: "#FFFFFF",
  },
  {
    color: "#0294D4",
    base: "#9EE1F7",
    dead: "#46778B",
    head: "#015E87",
  },
  {
    color: "#F24345",
    base: "#FDB6B7",
    dead: "#8E4849",
    head: "#A52D2F",
  },
]
var checkerColor1 = 255,
  checkerColor2 = 210

var lineWidth = 10
var jointSize = size / 1.25
var selectColor = "#FFFCC1"
//#endregion

var unit
var chains = []
var teams = []
var team = undefined
var selected = undefined
var possibleMoves = []
var aliveChains = []
var deadChains = []
var dragging = false
var defaultMove = 3
var winner = undefined
var localPlay = false
//callings
var display = true
var sortChains = true
var checkWin = false
//#region modes
var deathMode = DeathModes.ChainReset
var shortChain = true,
  maxChainLength = 3
var linkDeath = true
var specialCells = false
var friendlyFire = true
var selfharm = true
//Winconditions
var deathWin = true
var baseWin = true
//#endregion
//#region firebase
var gameCode = undefined
var connected = false
var gameRef
var gameLog = []
var connectedPlayers = {}
var user
var startLog
var moveKey = undefined
var turn = 1
function UpdateGameSettings(s) {
  deathMode = s.deathMode
  shortChain = s.shortChain
  maxChainLength = s.maxChainLength
  linkDeath = s.linkDeath
  specialCells = s.specialCells
  friendlyFire = s.friendlyFire
  selfharm = s.selfharm
  deathWin = s.deathWin
  baseWin = s.baseWin
  boardW = s.boardW
  boardH = s.boardH
}
//#region
function setup() {
  var auth = firebase.auth()
  gameCode = document.location.search.substr(1, document.location.search.length - 1)
  document.getElementById("gameCode").innerHTML = gameCode

  if (gameCode == "local") {
    gameSettings = settings
    UpdateGameSettings(settings)
    localPlay = true
    team = -1
    connected = true
    ReadySetup()
    return
  }

  if (gameCode.length != 6) document.getElementById("gameCode").innerHTML = "Game does not exist"
  gameRef = GetGameRef(gameCode)

  // if (auth.currentUser.uid != undefined) {
  //   //FIX if user is already sign in, you don't need to sign in again
  // }
  auth
    .signInAnonymously()
    .then(() => {
      user = auth.currentUser
      let name = user.displayName
      if (name == null) {
        name = generate_badass_gamertag()
        user.updateProfile({ displayName: name })
      }

      gameRef
        .child("settings")
        .get()
        .then((snap) => {
          if (snap.exists()) {
            gameSettings = snap.val()
            UpdateGameSettings(snap.val())
            JoinGame(gameCode, user).then((t) => {
              team = t
              document.getElementById("team").innerHTML = "You are " + (team == 0 ? "a spectator" : "team: " + team)
              document.getElementById("team").style.color = teamColors[team].color
              document.getElementById("turn").innerHTML = team == 1 ? "Your turn" : "Their turn"
              console.log("connected")
              connected = true
              ReadySetup()
            })

            gameRef.child("players").on("child_added", (player) => {
              let child = createDiv('<h2 id="user">' + player.val().username + "</h2>")
              select("#users").child(child)
              connectedPlayers[player.key] = {
                user: player,
                element: child,
              }
              child.style("color", teamColors[player.val().team].color)
            })
            gameRef.child("players").on("child_removed", (player) => {
              if (player.key == user.uid) JoinGame(gameCode, user, team)

              connectedPlayers[player.key].element.remove()
              delete connectedPlayers[player.key]
            })
          } else {
            document.getElementById("gameCode").innerHTML = "Game does not exist"
          }
        })
        .catch((error) => console.error(error))
    })
    .catch((error) => {
      console.log("Could not sign in")
      console.error(error)
    })
}
function ReadySetup() {
  canvas = createCanvas(boardW * size, boardH * size)
  FormatTeamColors()
  selectColor = color(selectColor)
  unit = canvas.width / boardW
  for (let i = 0; i < boardW; i++) {
    board[i] = new Array(boardH)
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
    return y == boardH - 1
  }

  BoardSetup()
  SetCanvas()
  if (localPlay) return
  gameRef.child("log").on("child_added", (snap) => {
    gameLog.push(snap.val())
    let log = snap.val()
    ApplyMoveFromLog(log, snap.key)
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

function FormatTeamColors() {
  for (let i = 0; i < teamColors.length; i++) {
    const keys = Object.keys(teamColors[i])
    const values = Object.values(teamColors[i])
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j]
      teamColors[i][key] = values[j]
    }
  }
}
function BoardSetup() {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      var move = 0
      if (x == int(boardW / 2) && y == int(boardH / 2)) move = 1
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
  canvas.resize(boardW * size, boardH * size)
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2)
  unit = canvas.width / boardW
  jointSize = size / 1.25
  Display()
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
    fill(teamColors[index].color)
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
  stroke(teamColors[selected.team].color)
  line(selected.head.pos.x * unit + unit / 2, selected.head.pos.y * unit + unit / 2, mouseX, mouseY)
  fill(teamColors[selected.team].color)
  strokeWeight(0)
  JointShape(mouseCell.x, mouseCell.y, jointSize)
}

function DrawBoard() {
  rectMode(CORNER)
  var bevel = 50
  stroke(0)
  for (let i = 0; i < boardW; i++) {
    for (let j = 0; j < boardH; j++) {
      SpaceColor(i, j)

      var a = 0,
        b = 0,
        c = 0,
        d = 0
      if (i == 0 && j == 0) a = bevel
      else if (i == boardW - 1 && j == 0) b = bevel
      else if (i == boardW - 1 && j == boardH - 1) c = bevel
      else if (i == 0 && j == boardH - 1) d = bevel
      strokeWeight(2)
      rect(i * unit, j * unit, unit, unit, a, b, c, d)
      let temp = CellToPixel(createVector(i, j))
      board[i][j].Shape(temp.x, temp.y)
    }
  }
}

function SpaceColor(x, y) {
  if ((x + y) % 2 == 0) fill(checkerColor1)
  else fill(checkerColor2)
  for (let t = 0; t < teams.length; t++) {
    const team = teams[t]
    if (team.base(x, y)) fill(teamColors[t].base)
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
  if (mouseX < 0 || mouseY < 0 || mouseX > boardW * unit || mouseY > boardH * unit) return

  let joint = UpperJoint(int(mouseX / unit), int(mouseY / unit))
  if (joint != undefined && joint.chain.team == turn && joint == joint.chain.head && (team == -1 || turn === team)) {
    selected = selected == undefined ? joint.chain : undefined
  }

  display = true
}
function mouseReleased() {
  if (!connected) return
  display = true
  if (mouseX < 0 || mouseY < 0 || mouseX > boardW * unit || mouseY > boardH * unit) return
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
function lineIntersection(a, b, c, d) {
  var det, gamma, lambda
  det = (b.y - a.y) * (d.x - c.x) - (d.y - c.y) * (b.x - a.x)
  if (pointIntersection(b, c, d) < 0.1) return true
  if (det === 0) {
    return false
  } else {
    lambda = ((d.x - c.x) * (d.y - a.y) + (c.y - d.y) * (d.x - a.x)) / det
    gamma = ((a.x - b.x) * (d.y - a.y) + (b.y - a.y) * (d.x - a.x)) / det
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1
  }
}
function pointIntersection(a, b, c) {
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
  if (deathWin) {
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
  if (baseWin) {
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
