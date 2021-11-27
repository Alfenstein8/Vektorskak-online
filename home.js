var username
var user
function HomeSetup() {
  startButton = select("#startButton")
  newOnlineButton = select("#newOnlineButton")
  input = select("#input")
  username = select("#username")
  newLocalButton = select("#newLocalButton")
  howToPlayButton = select("#howToPlayButton")
  firebase.auth().onAuthStateChanged((changedUser) => {
    user = changedUser
    if (changedUser.displayName != undefined) username.value(changedUser.displayName)
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
