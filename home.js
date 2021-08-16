var username
var user
function setup() {
  startButton = select("#startButton")
  newButton = select("#newButton")
  input = select("#input")
  username = select("#username")
  var auth = firebase.auth()
  auth.signInAnonymously()
  auth.onAuthStateChanged((changedUser) => {
    user = changedUser
    if (changedUser.displayName != undefined) username.value(changedUser.displayName)
  })
  startButton.mousePressed(() => {
    code = input.value()
    Username()
  })
  newButton.mousePressed(() => {
    CreateNewGame(user, settings).then(() => {
      Username()
    })
  })
}
function Username() {
  if (username.value() === "") {
    user.updateProfile({ displayName: generate_badass_gamertag() }).then(() => {
      GoToGame(code)
    })
  } else {
    if (user.displayName == username.value()) {
      GoToGame(code)
    } else {
      user.updateProfile({ displayName: username.value() }).then(() => {
        GoToGame(code)
      })
    }
  }
}
function GoToGame(code) {
  window.document.location = "./game.html?" + code
}
