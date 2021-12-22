var username
var user
function HomeSetup() {
  startButton = select("#startButton")
  newOnlineButton = select("#newOnlineButton")
  input = select("#input")
  username = select("#username")
  newLocalButton = select("#newLocalButton")
  howToPlayButton = select("#howToPlayButton")
  customizeButton = select("#customizeButton")
  homeButton = select("#homeButton")
  openGamesButton = select("#openGamesButton")
  profileBox = select("#profileBox")
  openGames = select("#openGames")
  home = select("#home")
  profile = select("#profile")

  firebase.auth().onAuthStateChanged((changedUser) => {
    user = changedUser
    if (changedUser.displayName != undefined) username.value(changedUser.displayName)
  })
  UpdateHomePanels()
  customizeButton.mousePressed(() => {
    profile.removeClass("hidden")
    home.addClass("hidden")
    openGames.addClass("hidden")
  })
  homeButton.mousePressed(() => {
    profile.addClass("hidden")
    home.removeClass("hidden")
    openGames.addClass("hidden")
  })
  openGamesButton.mousePressed(() => {
    profile.addClass("hidden")
    home.addClass("hidden")
    openGames.removeClass("hidden")
  })

  startButton.mousePressed(() => {
    gameID = input.value()
    Username()
  })
  newOnlineButton.mousePressed(() => {
    CreateNewGame(user, defaultGameSettings).then(() => {
      Username()
    })
  })
  newLocalButton.mousePressed(() => {
    gameID = "local"
    ChangePage(gamepage)
  })
  howToPlayButton.mousePressed(() => {
    ChangePage(rulespage)
  })
}
var resize = new ResizeObserver((entries) => {
  UpdateHomePanels()
})
function UpdateHomePanels() {
  console.log()
  if (window.innerWidth < 1000) {
    profile.addClass("hidden")
    home.removeClass("hidden")
    openGames.addClass("hidden")
  } else {
    profile.removeClass("hidden")
    home.removeClass("hidden")
    openGames.removeClass("hidden")
  }
}
resize.observe(document.body)
// input.addEventListener("keydown", (e) => { //Press enter in the input field to join
//   if (e.code === "Enter") {
//     gameID = input.value()
//     Username()
//   }
// })
function Username() {
  if (username.value() === "") {
    user.updateProfile({ displayName: generate_badass_gamertag() }).then(() => {
      ChangePage(gamepage)
    })
  } else {
    if (user.displayName == username.value()) {
      ChangePage(gamepage)
    } else {
      user.updateProfile({ displayName: username.value() }).then(() => {
        ChangePage(gamepage)
      })
    }
  }
}
