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
      fill(gameSettings.teamColors[this.team].dead)
      stroke(gameSettings.teamColors[this.team].dead)
    } else {
      fill(gameSettings.teamColors[this.team].color)
      stroke(gameSettings.teamColors[this.team].color)
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
      JointShape(this.joints[i].pos.x, this.joints[i].pos.y, jointSize)
    }
    for (let i = 0; i < this.joints.length; i++) {
      strokeWeight(0)
      fill(gameSettings.teamColors[this.team].head)
      if (i == this.joints.length - 1) {
        JointShape(this.joints[i].pos.x, this.joints[i].pos.y, jointSize / 2)
      } else if (i == this.joints.length - 2 && this.joints[i].pos.x - this.baseCell.x + this.joints[i].pos.y - this.baseCell.y != 0) {
        JointShape(this.joints[i].pos.x, this.joints[i].pos.y, jointSize / 3)
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

    if (joint != undefined) {
      if (joint.chain.baseCell.x - x + joint.chain.baseCell.y - y != 0 && inter.x == joint.chain.neck.pos.x && inter.y == joint.chain.neck.pos.y)
        joint.chain.Die()
      else die = true

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
          if (j == 0) {
            if (IsPointOnLineSegment(chain.joints[0].pos, this.head.pos, createVector(x, y))) return true
          } else {
            let start1 = this.head.pos
            let end1 = createVector(x, y)
            let start2 = chain.joints[j - 1].pos
            let end2 = chain.joints[j].pos
            if (IsLinesIntersecting(start1, end1, start2, end2) && !chain.dead) {
              return IsLinesIntersecting(start1, end1, start2, end2)
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
    if (this.chain.joints.length >= 2) {
      this.chain.neck = this.chain.joints[this.chain.joints.length - 2]
    }
  }
}
