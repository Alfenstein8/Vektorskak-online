const COLORS = {
  red: {
    name: "red",
    light: "#FDB6B7",
    normal: "#F24345",
    dark: "#A52D2F",
    grey: "#8E4849",
  },
  blue: {
    name: "blue",
    light: "#9EE1F7",
    normal: "#0294D4",
    dark: "#015E87",
    grey: "#46778B",
  },
  purple: {
    name: "purple",
    light: "#d6c8ea",
    normal: "#8b5fbf",
    dark: "#583483",
    grey: "#5a496e",
  },
  green: {
    name: "green",
    light: "#b3ffd7",
    normal: "#00bd5b",
    dark: "#008a42",
    grey: "#266444",
  },
  black: {
    name: "black",
    light: "#595959",
    normal: "#3e3e3e",
    dark: "#000000",
    grey: "#595959",
  },
  anti: {
    name: "anti",
    light: "#313131",
    normal: "#000000",
    dark: "#ffffff",
    grey: "#313131",
  },
  glitch: {
    name: "glitch",
    light: "#00ff04",
    normal: "#ff0000",
    dark: "#0000ff",
    grey: "#ff00ff",
  },
}
const SHAPES = {
  circular: 1,
  rectangle: 2,
  diamond: 3,
}
var teamColors = [COLORS.black, COLORS.blue, COLORS.red]
var teamShapes = [SHAPES.circular, SHAPES.circular, SHAPES.circular]
const defaultTeamColors = [COLORS.black, COLORS.blue, COLORS.red]
const DeathModes = {
  Dead: 0,
  BaseReset: 1,
  ChainReset: 2,
}
const MARKTYPE = {
  willDie: 0,
  wontDie: 1,
}

const defaultGameSettings = {
  owner: 0, //Owner of the game (server)
  spectatorsAllowed: 5, //Number of the maximum spectators in a game
  deathMode: DeathModes.ChainReset, //What happens when a chain is killed
  shortChain: true, //Is there a limit on how many joints a chain can have?
  maxChainLength: 3, // Maximum number of joints in a chain
  linkDeath: true,
  specialCells: false, //Is there a special cells that modify the game?
  friendlyFire: true, //Is it possible to kill own chains?
  selfharm: true, // is it possible for a chain to kill itself?
  deathWin: true, //Can you win by killing all the other teams chains?
  baseWin: true, //Can you win by reaching the other teams base?
  defaultMove: 3, //The maximum move reach for a chain
  boardW: 9,
  boardH: 15,
  setup: [
    {
      team: 1,
      x: 1,
      y: 0,
    },
    {
      team: 1,
      x: 4,
      y: 0,
    },
    {
      team: 1,
      x: 7,
      y: 0,
    },
    {
      team: 2,
      x: 1,
      y: 14,
    },
    {
      team: 2,
      x: 4,
      y: 14,
    },
    {
      team: 2,
      x: 7,
      y: 14,
    },
  ],
}
var homepage, gamepage, rulespage
var topTeamName, bottomTeamName
function setup() {
  //Runs when page loades
  topTeamName = select("#topTeamName")
  bottomTeamName = select("#bottomTeamName")
  rematchButton = select("#rematchButton")
  homepage = select("#homepage")
  gamepage = select("#gamepage")
  rulespage = select("#rulespage")
  gameID = document.location.search.substr(1, document.location.search.length - 1)
  SignInAnon((_user) => {
    user = _user
    HomeSetup()
    customizerSetup()
    gameBrowserSetup()
    if (gameID != "") ChangePage(gamepage)
    select("#gameBackHome").mousePressed(() => {
      LeaveGame()
      ChangePage(homepage)
    })
    select("#rulesBackHome").mousePressed(() => {
      ChangePage(homepage)
    })
  })
}
function ChangePage(page) {
  switch (page) {
    case homepage:
      homepage.removeClass("hidden")
      gamepage.addClass("hidden")
      history.pushState({ id: "homepage" }, "homepage", " ")
      rulespage.addClass("hidden")
      break
    case gamepage:
      gamepage.removeClass("hidden")
      homepage.addClass("hidden")
      history.pushState({ id: "gamepage" }, "gamepage", "?" + gameID)
      rulespage.addClass("hidden")

      SetupNewGame()
      break
    case rulespage:
      gamepage.addClass("hidden")
      homepage.addClass("hidden")
      rulespage.removeClass("hidden")
      break
  }
}
class Timer {
  constructor(startTime) {
    this.resetTime = startTime * 1000
    this.time = this.resetTime
    this.done = false
  }

  clock() {
    if (this.time > 0) this.time -= deltaTime
    else this.done = true
  }

  reset() {
    this.time = this.resetTime
    this.done = false
  }
}
