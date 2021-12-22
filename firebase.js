var firebaseConfig = {
  apiKey: "AIzaSyBAEAZUwv6wrox58Mp4b7_KHXeHzuRD7JI",
  authDomain: "vektorskak.firebaseapp.com",
  databaseURL: "https://vektorskak.firebaseio.com",
  projectId: "vektorskak",
  storageBucket: "vektorskak.appspot.com",
  messagingSenderId: "215591685010",
  appId: "1:215591685010:web:5c1057e909ab67d7d4cf4b",
  measurementId: "G-RGZ5MYRP6S",
}
// Initialize Firebase
var app = firebase.initializeApp(firebaseConfig)

var db = firebase.database().ref()
function GetAllGames(callback) {
  db.child("games")
    .get()
    .then((snap) => {
      callback(snap.val())
    })
}
function GameAdded(callback) {
  db.child("games").on("child_added", (game) => {
    callback(game.key)
  })
}

async function JoinGame(gameID, User, team) {
  let gameRef = GetGameRef(gameID)
  let playerSnap = await gameRef.child("players").get()
  team = team == undefined ? FindTeam(playerSnap, User) : team
  gameRef.child("players").child(User.uid).onDisconnect().remove()
  await gameRef
    .child("players")
    .child(User.uid)
    .set({
      username: User.displayName,
      team: team,
      skin: userProfile,
    })
    .then(() => {
      console.log("connected to " + gameID)
    })
    .catch((error) => console.error(error))
  if (team != 0) {
    await gameRef
      .child("teams")
      .child(team)
      .set({
        uid: User.uid,
      })
      .then(() => {
        gameRef.child("teams").child(team).onDisconnect().remove()
      })
      .catch((error) => console.error(error))
  }

  return Promise.resolve(team)
}
function LeaveGame() {
  let ref = GetGameRef(gameID)
  if (ref == undefined) return
  RemoveListenersFromGame(gameID)
  ref.child("players").child(user.uid).remove()
  if (team != 0 && !localPlay) ref.child("teams").child(team).remove()
  DeleteUserList()
  console.log("disconnected from " + gameID)
}
function RemoveListenersFromGame(gameID) {
  ref = GetGameRef(gameID)
  ref.child("players").off("child_removed")
  ref.child("players").off("child_added")
  ref.child("log").off("child_added")
  ref.child("games").off("child_added")
  ref.child("teams").child("1").child("rematch").off("value")
  ref.child("teams").child("2").child("rematch").off("value")
}
function FindTeam(playerSnap, User) {
  if (playerSnap.exists()) {
    if (playerSnap.val().hasOwnProperty(User.uid)) return playerSnap.val()[User.uid].team
    let t = 1
    while (true) {
      for (let p = 0; p < Object.keys(playerSnap.val()).length; p++) {
        const player = playerSnap.val()[Object.keys(playerSnap.val())[p]]
        if (player.team == t) break
        if (p >= Object.keys(playerSnap.val()).length - 1) {
          return t
        }
      }
      if (t == 2) break
      t++
    }
  } else {
    return 1
  }
  return 0
}

async function CreateNewGame(User, settings) {
  settings.owner = User.uid
  let gameRef
  gameID = GenerateCode(6)
  gameRef = GetGameRef(gameID)
  await gameRef.child("settings").set(settings)
  return gameRef
}

function RequestRematch(gameID) {
  GetGameRef(gameID).child("teams").child(team).set({ uid: user.uid, rematch: true })
}
function LogMove(gameID, team, from, to) {
  let log = GetGameRef(gameID).child("log")
  let newLog = log.push()
  moveKey = newLog.key
  newLog
    .set({
      from: { x: from.x, y: from.y },
      to: { x: to.x, y: to.y },
      team: team,
    })
    .catch((error) => {
      console.error(error)
    })
  moveKey = newLog.key
}

function SignInAnon(callback) {
  firebase
    .auth()
    .signInAnonymously()
    .then(() => {
      callback(firebase.auth().currentUser)
    })
    .catch((error) => {
      console.log("Could not sign in")
      console.error(error)
    })
}
function GetSettingsFromGame(gameID, callback) {
  let ref = GetGameRef(gameID)
  if (ref === undefined) return
  ref
    .child("settings")
    .get()
    .then((snap) => {
      if (snap.exists()) callback(snap.val())
      else callback(undefined)
    })
    .catch((error) => {
      console.error(error)
    })
}
let gameRef
function GetGameRef(gameID) {
  if (gameID === undefined || gameID === null || gameID == "") {
    console.error("Invalid gameID")
    return undefined
  }
  if (gameRef === undefined) {
    gameRef = db.child("games").child(gameID)
  }
  if (gameID != gameRef.key) {
    gameRef = db.child("games").child(gameID)
  }
  return gameRef
}
function PlayerJoined(gameID, callback) {
  GetGameRef(gameID)
    .child("players")
    .on("child_added", (player) => {
      callback(player)
    })
}

function PlayerLeft(gameID, callback) {
  GetGameRef(gameID)
    .child("players")
    .on("child_removed", (player) => {
      callback(player)
    })
}
let team1Rematch = false,
  team2Rematch = false
function OnRematch(gameID, callback) {
  GetGameRef(gameID)
    .child("teams")
    .child("1")
    .child("rematch")
    .on("value", (snap) => {
      team1Rematch = snap.val()
      if (team1Rematch && team2Rematch) callback()
    })
  GetGameRef(gameID)
    .child("teams")
    .child("2")
    .child("rematch")
    .on("value", (snap) => {
      team2Rematch = snap.val()
      if (team1Rematch && team2Rematch) callback()
    })
}
function ResetGame(gameID) {
  GetGameRef(gameID).child("log").remove()
}

function LogAdded(gameID, callback) {
  GetGameRef(gameID)
    .child("log")
    .on("child_added", (snap) => {
      callback(snap.val(), snap.key)
    })
}

function GenerateCode(length) {
  let charaters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz1234567890"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += charaters[int(random(0, charaters.length - 1))]
  }
  return code
}
