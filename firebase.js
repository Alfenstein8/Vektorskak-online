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

async function JoinGame(code, User, team) {
  let gameRef = GetGameRef(code)
  let playerSnap = await gameRef.child("players").get()
  team = team == undefined ? FindTeam(playerSnap, User) : team
  await gameRef
    .child("players")
    .child(User.uid)
    .set({
      username: User.displayName,
      team: team,
    })
    .then(() => {
      gameRef.child("players").child(User.uid).onDisconnect().remove()
    })
    .catch((error) => console.error(error))
  return Promise.resolve(team)
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
  code = GenerateCode(6)
  gameRef = db.child("games").child(code).child("settings")
  await gameRef.set(settings)
  return gameRef
}
function LogMove(code, team, fromX, fromY, toX, toY) {
  let log = GetGameRef(code).child("log")
  let newLog = log.push()
  moveKey = newLog.key //FIX moveKey is out of scope
  newLog
    .set({
      from: { x: fromX, y: fromY },
      to: { x: toX, y: toY },
      team: team,
    })
    .catch((error) => {
      console.error(error)
    })
  return newLog.key
}
function GetGameRef(code) {
  return db.child("games").child(code)
}
function GenerateCode(length) {
  let charaters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz1234567890"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += charaters[int(random(0, charaters.length - 1))]
  }
  return code
}
