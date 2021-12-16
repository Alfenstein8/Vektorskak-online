var canvas
const boardSize = 20
var size = window.innerHeight / boardSize
var board = []

var lineWidth = size / 4
var jointSize = size / 1.25
var markSize = size / 2
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

var sureRematch = false
function DecideRematch() {
  if (!sureRematch) {
    document.getElementById("rematchButton").innerHTML = "sure?"
    sureRematch = true
    setTimeout(() => {
      document.getElementById("rematchButton").innerHTML = "rematch"
      sureRematch = false
    }, 2000)
    return
  }
  if (localPlay) {
    if (gameLog.length != 0) SetupNewGame()
  } else {
    RequestRematch(gameID)
  }
}
//#region
function SetupNewGame() {
  defaultGameSettings.teamColors[1] = teamColors.blue
  defaultGameSettings.teamColors[2] = teamColors.red
  aliveChains = []
  deadChains = []
  gameLog = []
  turn = 1
  moveKey = undefined
  winner = undefined
  topTeamName.removeAttribute("style")
  topTeamName.html("Waiting for player...")
  bottomTeamName.removeAttribute("style")
  bottomTeamName.html("Waiting for player...")

  rematchButton.mousePressed(DecideRematch)

  document.getElementById("gameCode").innerHTML = "Code: " + gameID
  localPlay = gameID == "local"

  if (localPlay) {
    topTeamName.html("")
    bottomTeamName.html("")
    connected = true
    team = 2
    UpdateTurnUI()
    ReadySetup()
    return
  }
  if (gameID.length != 6) document.getElementById("gameCode").innerHTML = "Game does not exist"

  let name = user.displayName
  if (name == null) {
    name = generate_badass_gamertag()
    user.updateProfile({ displayName: name })
  }

  GetSettingsFromGame(gameID, (_settings) => {
    if (_settings != undefined) {
      gameSettings = _settings
      JoinGame(gameID, user).then((t) => {
        team = t
        UpdateTurnUI()
        connected = true
        ReadySetup()
        PlayerJoined(gameID, (player) => {
          let child
          if ((player.val().team == team && team != 0) || (player.val().team == 2 && team == 0)) {
            child = bottomTeamName
          } else if (player.val().team == 2 || player.val().team == 1) {
            child = topTeamName
          } else {
            child = createP(player.val().username)
            select("#users").child(child)
          }

          child.html(player.val().username)
          connectedPlayers[player.key] = {
            user: player.val(),
            element: child,
          }
          UpdateTeamNames()
        })
      })

      PlayerLeft(gameID, (player) => {
        connectedPlayers[player.key].element.removeAttribute("style")
        if (player.key == user.uid) JoinGame(gameID, user, team)
        if (connectedPlayers[player.key].user.team != 0) connectedPlayers[player.key].element.html("Waiting for player...")
        else connectedPlayers[player.key].element.remove()
        connectedPlayers[player.key].element.style("color", "white")
        delete connectedPlayers[player.key]
      })
      OnRematch(gameID, () => {
        ResetGame(gameID)
        RemoveListenersFromGame(gameID)
        DeleteUserList()
        SetupNewGame()
      })
    } else {
      document.getElementById("gameCode").innerHTML = "Game does not exist"
    }
  })
}
function DeleteUserList() {
  let users = document.querySelectorAll("#users > *")
  for (let user of users) {
    user.remove()
  }
}

function ReadySetup() {
  canvas = createCanvas(gameSettings.boardW * size, gameSettings.boardH * size)
  canvas.parent("board")
  canvas.style("position", "relative")
  canvas.style("height", "auto")
  canvas.style("width", "auto")
  if (team != 1 || localPlay) canvas.style("transform", "rotate(0deg)")
  else canvas.style("transform", "rotate(180deg)")
  FormatteamColors()
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
    if (logID != moveKey || localPlay) {
      moveKey = logID
      ApplyMoveFromLog(log)
    }
  })
}
function ApplyMoveFromLog(log) {
  let joint = GetUpperJoint(log.from)
  if (joint == undefined || joint.chain.head != joint) {
    document.getElementById("gameCode").innerHTML = "Something went wrong. Make a new game"
    return
  }
  joint.chain.Move(log.to)
  NextTurn()
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
    unit = canvas.width / gameSettings.boardW
    jointSize = size / 1.25
    lineWidth = size / 4
    markSize = size / 2
    UpdateTeamNames(false)
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
    fill(gameSettings.teamColors[index].normal)
    ShowText("Player " + index + " wins", width / 2, height / 2)
  }
}
function Display() {
  if (!connected) return
  clear()
  DrawBoard()

  deadChains.forEach((chain) => {
    chain.Draw()
  })
  aliveChains.forEach((chain) => {
    chain.Draw()
  })
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
  if (GetMousePos().x < 0 || GetMousePos().y < 0 || GetMousePos().x > gameSettings.boardW * unit || GetMousePos().y > gameSettings.boardH * unit)
    return
  let joint = GetUpperJoint(GetMouseCell())
  //console.log(IsTeamHead(joint))
  if (joint != undefined && joint.chain.team == turn && joint == joint.chain.head && (localPlay || turn === team)) {
    selected = selected == undefined ? joint.chain : undefined
  }

  display = true
}

function mouseReleased() {
  if (!connected) return
  display = true
  if (GetMousePos().x < 0 || GetMousePos().y < 0 || GetMousePos().x > gameSettings.boardW * unit || GetMousePos().y > gameSettings.boardH * unit)
    return

  if (selected == undefined || selected.head == GetUpperJoint(GetMouseCell())) return
  let destination = GetMouseCell()

  let startpos = selected.head.pos
  if (selected.CanMoveTo(destination.x, destination.y)) {
    selected.Move(destination)
    if (!localPlay) {
      LogMove(gameID, selected.team, startpos, destination)
    }
    NextTurn()
  }
  selected = undefined
}

function GetUpperJoint(cellCordinates) {
  let x = cellCordinates.x,
    y = cellCordinates.y

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
function NextTurn() {
  turn = turn == teams.length - 1 ? 1 : turn + 1

  UpdateTurnUI()
}
function ValueInside(x, value1, value2) {
  let max = Math.max(value1, value2)
  let min = Math.min(value1, value2)
  return min < x && x < max
}

function FindIntersectionPoint(p0, p1, p2, p3) {
  let A1 = p1.y - p0.y,
    B1 = p0.x - p1.x,
    C1 = A1 * p0.x + B1 * p0.y,
    A2 = p3.y - p2.y,
    B2 = p2.x - p3.x,
    C2 = A2 * p2.x + B2 * p2.y,
    denominator = A1 * B2 - A2 * B1
  if (IsPointInside(p1, p2, p3)) return p1
  if (denominator == 0) {
    //The lines are parallel

    if (p0.x == p1.x) {
      //Lines vertical

      if ((ValueInside(p0.y, p2.y, p3.y) || ValueInside(p1.y, p2.y, p3.y)) && p0.x == p2.x) {
        return true
      } else {
        return null
      }
    } else {
      slope1 = A1 / B1
      slope2 = A2 / B2

      axe1 = -slope1 * p1.x + p1.y
      axe2 = -slope2 * p2.x + p2.y

      if (abs(slope1) == abs(slope2) && axe1 == axe2) {
        //Same line
        if (ValueInside(p0.x, p2.x, p3.x) || ValueInside(p1.x, p2.x, p3.x)) {
          //Same linesegment
          return true
        }
      }
    }
    return null
  }
  if ((p1 == p2) != (p0 == p3)) {
    return null
  }
  var intersectX = (B2 * C1 - B1 * C2) / denominator,
    intersectY = (A1 * C2 - A2 * C1) / denominator,
    rx0 = (intersectX - p0.x) / (p1.x - p0.x),
    ry0 = (intersectY - p0.y) / (p1.y - p0.y),
    rx1 = (intersectX - p2.x) / (p3.x - p2.x),
    ry1 = (intersectY - p2.y) / (p3.y - p2.y)

  if (((rx0 >= 0 && rx0 <= 1) || (ry0 >= 0 && ry0 <= 1)) && ((rx1 >= 0 && rx1 <= 1) || (ry1 >= 0 && ry1 <= 1))) {
    return {
      x: intersectX,
      y: intersectY,
    }
  } else {
    return null
  }
}
function IsPointInside(point, start, end) {
  let diff1x = point.x - start.x
  let diff1y = point.y - start.y

  let diff2x = point.x - end.x
  let diff2y = point.y - end.y

  if (abs(diff1x) == abs(diff1y) && abs(diff2x) == abs(diff2y) && ValueInside(point.x, start.x, end.x) && ValueInside(point.y, start.y, end.y)) {
    // Diagonal line
    return point
  }

  if (
    (point.x == start.x && point.x == end.x && ValueInside(point.y, start.y, end.y)) ||
    (point.y == start.y && point.y == end.y && ValueInside(point.x, start.x, end.x))
  ) {
    //horizontal or vertical line
    return point
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
  var position = createVector(cell.x * unit + unit / 2, cell.y * unit + unit / 2)
  if (team == 1) position = createVector(gameSettings.boardW * unit - position.x, gameSettings.boardH * unit - position.y)
  return position
}
function PixelToCell(pos) {
  let cell = createVector(floor(pos.x / unit), floor(pos.y / unit))
  if (team == 1) cell = createVector(gameSettings.boardW - cell.x - 1, gameSettings.boardH - cell.y - 1)
  return cell
}
function GetMouseCell() {
  return PixelToCell(createVector(mouseX, mouseY))
}
function GetMousePos() {
  let pos = createVector(mouseX, mouseY)
  if (team == 1) pos = createVector(gameSettings.boardW * unit - pos.x, gameSettings.boardH * unit - pos.y)
  return pos
}
