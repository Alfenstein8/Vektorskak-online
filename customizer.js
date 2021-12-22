var userProfile = {
  color: [COLORS.black, COLORS.blue, COLORS.red],
  shape: SHAPES.circular,
}
function customizerSetup() {
  let _tempProfile = getUserProfile()
  if (_tempProfile != null) {
    userProfile = _tempProfile
  }
  switchColorDot(userProfile.color[1])
  switchColorDot(userProfile.color[2])
  switchShapeDot(userProfile.shape)

  select("#red").mousePressed(() => {
    switchColorDot(COLORS.red)
    userProfile.color[2] = COLORS.red
    saveUserProfile()
  })
  select("#purple").mousePressed(() => {
    switchColorDot(COLORS.purple)
    userProfile.color[2] = COLORS.purple
    saveUserProfile()
  })
  select("#blue").mousePressed(() => {
    switchColorDot(COLORS.blue)
    userProfile.color[1] = COLORS.blue
    saveUserProfile()
  })
  select("#green").mousePressed(() => {
    switchColorDot(COLORS.green)
    userProfile.color[1] = COLORS.green
    saveUserProfile()
  })

  select("#circle").mousePressed(() => {
    switchShapeDot(SHAPES.circular)
    userProfile.shape = SHAPES.circular
    saveUserProfile()
  })
  select("#rectangle").mousePressed(() => {
    switchShapeDot(SHAPES.rectangle)
    userProfile.shape = SHAPES.rectangle
    saveUserProfile()
  })
  select("#diamond").mousePressed(() => {
    switchShapeDot(SHAPES.diamond)
    userProfile.shape = SHAPES.diamond
    saveUserProfile()
  })
}
function saveUserProfile() {
  localStorage.setItem("userProfile", JSON.stringify(userProfile))
}
function getUserProfile() {
  return JSON.parse(localStorage.getItem("userProfile"))
}
function switchColorDot(color) {
  switch (color.name) {
    case COLORS.red.name:
      select("#redDot").removeClass("hidden")
      select("#purpleDot").addClass("hidden")
      break
    case COLORS.purple.name:
      select("#redDot").addClass("hidden")
      select("#purpleDot").removeClass("hidden")
      break
    case COLORS.blue.name:
      select("#blueDot").removeClass("hidden")
      select("#greenDot").addClass("hidden")
      break

    case COLORS.green.name:
      select("#blueDot").addClass("hidden")
      select("#greenDot").removeClass("hidden")
      break
  }
}

function switchShapeDot(shape) {
  switch (shape) {
    case SHAPES.circular:
      select("#circleDot").removeClass("hidden")
      select("#rectangleDot").addClass("hidden")
      select("#diamondDot").addClass("hidden")
      break
    case SHAPES.rectangle:
      select("#circleDot").addClass("hidden")
      select("#rectangleDot").removeClass("hidden")
      select("#diamondDot").addClass("hidden")
      break
    case SHAPES.diamond:
      select("#circleDot").addClass("hidden")
      select("#rectangleDot").addClass("hidden")
      select("#diamondDot").removeClass("hidden")
      break
  }
}
