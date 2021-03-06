class Chain {
  constructor(x, y, team) {
    this.chain = this
    this.joints = []
    this.head
    new Joint(x, y, this)
    this.neck = undefined
    this.team = team
    this.dead = false
    this.baseCell = createVector(x, y)
    this.moveDistance = gameSettings.defaultMove
    teams[this.team].chains.push(this)
    aliveChains.push(this)
  }
  Draw() {
    if (this.dead) {
      fill(teamColors[this.team].grey)
      stroke(teamColors[this.team].grey)
    } else {
      fill(teamColors[this.team].normal)
      stroke(teamColors[this.team].normal)
    }
    for (let i = 0; i < this.joints.length; i++) {
      strokeWeight(lineWidth)
      if (i != 0)
        line(
          this.joints[i].pos.x * unit + unit / 2,
          this.joints[i].pos.y * unit + unit / 2,
          this.joints[i - 1].pos.x * unit + unit / 2,
          this.joints[i - 1].pos.y * unit + unit / 2
        )
    }
    for (let i = 0; i < this.joints.length; i++) {
      strokeWeight(0)
      if (selected == this && i == this.joints.length - 1) {
        stroke(0)
        strokeWeight(1)
      }
      JointShape(this.joints[i].pos.x, this.joints[i].pos.y, jointSize, teamShapes[this.team])
    }
    for (let i = 0; i < this.joints.length; i++) {
      strokeWeight(0)
      fill(teamColors[this.team].dark)
      if (i == this.joints.length - 1) {
        JointShape(this.joints[i].pos.x, this.joints[i].pos.y, jointSize / 2, teamShapes[this.team])
      } else if (this.joints[i].chain.neck == this.joints[i]) {
        JointShape(this.joints[i].pos.x, this.joints[i].pos.y, jointSize / 3, teamShapes[this.team])
      }
    }
  }
  Move(destination) {
    display = true
    checkWin = true
    let die = false
    let x = destination.x,
      y = destination.y
    if (!this.CanMoveTo(x, y)) return false
    let joint = GetUpperJoint(destination)
    let self = false
    let inter = this.CheckIntersections(x, y)
    let log = { team: this.team, from: { x: this.head.pos.x, y: this.head.pos.y }, to: { x: destination.x, y: destination.y } }
    if (localPlay) gameLog.push(log)
    if (joint != undefined) {
      if (joint.chain.neck != undefined) {
        if (inter.x == joint.chain.neck.pos.x && inter.y == joint.chain.neck.pos.y) joint.chain.Die()
        else die = true
      } else die = true

      if (joint.chain == this) self = true
    } else {
      if (gameSettings.linkDeath) die = inter ? true : die
    }

    if (!die && !self) new Joint(x, y, this)
    if (gameSettings.shortChain && this.joints.length > gameSettings.maxChainLength) this.RemoveJoint(0)
    if (die) this.Die()
    checkWin = true
    return true
  }
  CheckIntersections(x, y) {
    for (let c = 0; c < aliveChains.length; c++) {
      const chain = aliveChains[c]
      if ((gameSettings.friendlyFire ? true : chain.team != this.team) || (gameSettings.selfharm ? chain == this : false)) {
        for (let j = 0; j < chain.joints.length; j++) {
          let start1 = this.head.pos
          let end1 = createVector(x, y)
          let end2 = chain.joints[j].pos
          if (j == 0) {
            if (IsPointInside(end2, start1, end1)) return end2
          } else {
            let start2 = chain.joints[j - 1].pos
            if (FindIntersectionPoint(start1, end1, start2, end2) && !chain.dead) {
              return FindIntersectionPoint(start1, end1, start2, end2)
            }
          }
        }
      }
    }
    return false
  }
  MoveRelative(x, y) {
    this.Move(this.head.pos.x + x, this.head.pos.y + y)
  }
  Die() {
    if (gameSettings.deathMode == DeathModes.ChainReset) {
      if (this.joints.length > 2) this.ChainReset()
      else this.BaseReset()
    } else if (gameSettings.deathMode == DeathModes.BaseReset) {
      this.BaseReset()
    } else {
      this.dead = true
      aliveChains.splice(aliveChains.indexOf(this), 1)
      deadChains.push(this)
    }
  }
  ChainReset() {
    let base = this.joints[0].pos
    this.ClearChain()
    this.head = new Joint(base.x, base.y, this)
    this.neck = undefined
  }
  BaseReset() {
    this.ClearChain()
    let cell = GetUpperJoint(this.baseCell)
    if (cell != undefined) {
      cell.chain.Die()
    }
    new Joint(this.baseCell.x, this.baseCell.y, this)
    this.neck = undefined
  }
  CanMoveTo(x, y) {
    return (
      abs(this.head.pos.x - x) + abs(this.head.pos.y - y) <=
        this.moveDistance + (gameSettings.specialCells ? board[this.head.pos.x][this.head.pos.y].extraMovement : 0) &&
      abs(this.head.pos.x - x) + abs(this.head.pos.y - y) > 0
    )
  }
  RemoveJoint(joint) {
    if (!isNaN(joint)) {
      joint = this.joints[joint]
    }

    if (joint.chain != undefined) {
      this.joints.splice(this.joints.indexOf(joint), 1)
      let cont = board[joint.pos.x][joint.pos.y].content
      cont.splice(cont.indexOf(joint))
      return true
    }
    return false
  }
  ClearChain() {
    let length = this.joints.length
    for (let i = 0; i < length; i++) {
      this.RemoveJoint(0)
    }
  }
}
class Joint {
  constructor(x, y, chain) {
    this.pos = createVector(x, y)
    this.chain = chain
    this.chain.joints.push(this)

    board[x][y].content.push(this)
    this.chain.head = this
    let second = this.chain.joints[this.chain.joints.length - 2]
    if (this.chain.joints.length >= 2 && !(second.pos.x == this.chain.baseCell.x && second.pos.y == this.chain.baseCell.y)) {
      this.chain.neck = this.chain.joints[this.chain.joints.length - 2]
    }
  }
}
