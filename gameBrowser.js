var gamesContainer
function gameBrowserSetup() {
  gamesContainer = select("#openGamesContainer")
  GameAdded((gameID) => {
    setTimeout(function () {
      GetGameRef(gameID)
        .get()
        .then((game) => {
          if (game.val().players != null) {
            DisplayGame(game.val(), gameID)
          }
        })
    }, 1000)
  })
}
function DisplayGame(game, key) {
  let name
  for (const ID in game.players) {
    name = game.players[ID].username
  }
  let child = createDiv("<p>" + name + "</p><button id=" + key + " onclick='gamePressed(this)'>Join</button>")
  child.addClass("openGame")
  gamesContainer.child(child)
}
function gamePressed(element) {
  gameID = element.id
  if (user.displayName != username.value()) {
    SetUsername(username.value(), () => {
      ChangePage(gamepage)
    })
  } else {
    ChangePage(gamepage)
  }
}
