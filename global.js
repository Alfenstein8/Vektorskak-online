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
  ],
}
var homepage, gamepage

function setup() {
  //Runs when page loades
  homepage = select("#homepage")
  gamepage = select("#gamepage")
  gameID = document.location.search.substr(1, document.location.search.length - 1)
  SignInAnon((_user) => {
    user = _user
    if (gameID != "") ChangePage(gamepage)
    HomeSetup()
    select("#backHome").mousePressed(() => {
      LeaveGame()
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
      break
    case gamepage:
      gamepage.removeClass("hidden")
      homepage.addClass("hidden")
      history.pushState({ id: "gamepage" }, "gamepage", "?" + gameID)

      GameSetup()
      break
  }
}
