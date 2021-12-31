var username
var user
let mobileLayout
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
  mobileLayout = false
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
    if (user.displayName != username.value()) {
      SetUsername(username.value(), () => {
        ChangePage(gamepage)
      })
    } else {
      ChangePage(gamepage)
    }
  })
  newOnlineButton.mousePressed(() => {
    CreateNewGame(user, defaultGameSettings).then(() => {
      if (user.displayName != username.value()) {
        SetUsername(username.value(), () => {
          ChangePage(gamepage)
        })
      } else {
        ChangePage(gamepage)
      }
    })
  })
  newLocalButton.mousePressed(() => {
    gameID = "local"
    ChangePage(gamepage)
  })
  howToPlayButton.mousePressed(() => {
    ChangePage(rulespage)
  })
  UpdateHomePanels()
}
var resize = new ResizeObserver((entries) => {
  UpdateHomePanels()
})
function UpdateHomePanels() {
  if (window.innerWidth < 1000 && !mobileLayout) {
    mobileLayout = true
    profile.addClass("hidden")
    home.removeClass("hidden")
    openGames.addClass("hidden")
  }
  if (window.innerWidth > 1000) {
    mobileLayout = false
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
