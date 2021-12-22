var gamesContainer
function gameBrowserSetup() {
  gamesContainer = select("#openGamesContainer")
  GameAdded((gameID) => {
    setTimeout(function () {
      GetGameRef(gameID)
        .get()
        .then((game) => {
          if (game.val().players != null) {
            DisplayGame(game.val())
          }
        })
    }, 1000)
  })
}

function DisplayGame(game) {
  let name
  for (const ID in game.players) {
    name = game.players[ID].username
  }
  let child = createDiv("<p>" + name + "</p><button>Join</button>")
  gamesContainer.child(child)
  child.mousePressed(() => {
    gameID = key
    Username()
  })
}
