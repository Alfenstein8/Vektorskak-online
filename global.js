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
  teamColors: [
    {
      // color: "#36393F",
      // base: "#777E8B",
      // dead: "#565B65",
      // head: "#0A0A0C",
      normal: "#FFFFFF",
      light: "#FFFFFF",
      grey: "#FFFFFF",
      dark: "#FFFFFF",
    },
    {
      normal: "#0294D4",
      light: "#9EE1F7",
      grey: "#46778B",
      dark: "#015E87",
    },
    {
      normal: "#F24345",
      light: "#FDB6B7",
      grey: "#8E4849",
      dark: "#A52D2F",
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
    if (gameID != "") ChangePage(gamepage)
    HomeSetup()
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
      history.pushState({ id: "homepage" }, "homepage", "")
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
