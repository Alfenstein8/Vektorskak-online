const DeathModes = {
  Dead: 0,
  BaseReset: 1,
  ChainReset: 2,
}

const settings = {
  owner: 0,
  spectatorsAllowed: 5,
  deathMode: DeathModes.ChainReset,
  shortChain: true,
  maxChainLength: 3,
  linkDeath: true,
  specialCells: false,
  friendlyFire: true,
  selfharm: true,
  deathWin: true,
  baseWin: true,
  boardW: 9,
  boardH: 15,
  setup: [
    {
      team: 1,
      x: 1,
      y: 0,
    },
    {
      team: 1,
      x: 4,
      y: 0,
    },
    {
      team: 1,
      x: 7,
      y: 0,
    },
    {
      team: 2,
      x: 1,
      y: 14,
    },
    {
      team: 2,
      x: 4,
      y: 14,
    },
    {
      team: 2,
      x: 7,
      y: 14,
    },
  ],
}
