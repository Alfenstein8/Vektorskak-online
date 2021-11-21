class Chain {
  constructor(x, y, team) {
    this.joints = []
    this.head
    new Joint(x, y, this)
    this.neck = undefined
    this.team = team
    this.dead = false
    this.baseCell = createVector(x, y)
    this.moveDistance = defaultMove
    teams[this.team].chains.push(this)
    aliveChains.push(this)
  }
  Draw() {
    if (this.dead) {
      fill(teamColors[this.team].dead)
      stroke(teamColors[this.team].dead)
    } else {
      fill(teamColors[this.team].color)
      stroke(teamColors[this.team].color)
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
      fill(teamColors[this.team].head)
      if (i == this.joints.length - 1) {
        JointShape(this.joints[i].pos.x, this.joints[i].pos.y, jointSize / 2)
      } else if (i == this.joints.length - 2 && this.joints[i].pos.x - this.baseCell.x + this.joints[i].pos.y - this.baseCell.y != 0) {
        JointShape(this.joints[i].pos.x, this.joints[i].pos.y, jointSize / 3)
      }
    }
  }
  Move(x, y, logMove) {
    display = true
    checkWin = true
    let die = false
    if (!this.CanMoveTo(x, y)) return
    if (logMove == undefined || logMove == true) {
      moveKey = LogMove(gameCode, this.team, this.head.pos.x, this.head.pos.y, x, y)
    }
    let joint = UpperJoint(x, y)
    let self = false
    if (joint != undefined) {
      if (
        joint.chain.neck == joint &&
        (linkDeath ? pointIntersection(joint.chain.head.pos, createVector(x, y), this.head.pos) > 0.1 : true) &&
        joint.chain.baseCell.x - x + joint.chain.baseCell.y - y != 0
      )
        joint.chain.Die()
      else die = true

      if (joint.chain == this) self = true
    }

    if (linkDeath) die = this.CheckIntersections(x, y) ? true : die
    if (!die && !self) new Joint(x, y, this)
    if (shortChain && this.joints.length > maxChainLength) this.RemoveJoint(0)

    if (die) this.Die()
    checkWin = true
  }
  CheckIntersections(x, y) {
    for (let c = 0; c < aliveChains.length; c++) {
      const chain = aliveChains[c]
      if ((friendlyFire ? true : chain.team != this.team) || (selfharm ? chain == this : false)) {
        for (let j = 1; j < chain.joints.length; j++) {
          let start1 = this.head.pos
          let end1 = createVector(x, y)
          let start2 = chain.joints[j - 1].pos
          let end2 = chain.joints[j].pos
          if (lineIntersection(start1, end1, start2, end2) && !chain.dead) {
            return true
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
    if (deathMode == DeathModes.ChainReset) {
      if (this.joints.length > 2) this.ChainReset()
      else this.BaseReset()
    } else if (deathMode == DeathModes.BaseReset) {
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
    let cell = UpperJoint(this.baseCell.x, this.baseCell.y)
    if (cell != undefined) {
      cell.chain.Die()
    }
    new Joint(this.baseCell.x, this.baseCell.y, this)
    this.neck = undefined
  }
  CanMoveTo(x, y) {
    return (
      abs(this.head.pos.x - x) + abs(this.head.pos.y - y) <=
        this.moveDistance + (specialCells ? board[this.head.pos.x][this.head.pos.y].extraMovement : 0) &&
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
