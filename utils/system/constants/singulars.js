import mapify from './mapify'

export const CREATURE_TYPE_ABERRATION = 'aberration'
export const CREATURE_TYPE_BEAST = 'beast'
export const CREATURE_TYPE_CELESTIAL = 'celestial'
export const CREATURE_TYPE_CONSTRUCT = 'construct'
export const CREATURE_TYPE_DRAGON = 'dragon'
export const CREATURE_TYPE_ELEMENTAL = 'elemental'
export const CREATURE_TYPE_FEY = 'fey'
export const CREATURE_TYPE_FIEND = 'fiend'
export const CREATURE_TYPE_GIANT = 'giant'
export const CREATURE_TYPE_HUMANOID = 'humanoid'
export const CREATURE_TYPE_MONSTROSITY = 'monstrosity'
export const CREATURE_TYPE_OOZE = 'ooze'
export const CREATURE_TYPE_PLANT = 'plant'
export const CREATURE_TYPE_UNDEAD = 'undead'
export const LIST_CREATURE_TYPES = [
  CREATURE_TYPE_ABERRATION,
  CREATURE_TYPE_BEAST,
  CREATURE_TYPE_CELESTIAL,
  CREATURE_TYPE_CONSTRUCT,
  CREATURE_TYPE_DRAGON,
  CREATURE_TYPE_ELEMENTAL,
  CREATURE_TYPE_FEY,
  CREATURE_TYPE_FIEND,
  CREATURE_TYPE_GIANT,
  CREATURE_TYPE_HUMANOID,
  CREATURE_TYPE_MONSTROSITY,
  CREATURE_TYPE_OOZE,
  CREATURE_TYPE_PLANT,
  CREATURE_TYPE_UNDEAD
]
export const RAW_CREATURE_TYPES = {
  [CREATURE_TYPE_ABERRATION]: 'aberrations',
  [CREATURE_TYPE_BEAST]: 'beasts',
  [CREATURE_TYPE_CELESTIAL]: 'celestials',
  [CREATURE_TYPE_CONSTRUCT]: 'constructs',
  [CREATURE_TYPE_DRAGON]: 'dragons',
  [CREATURE_TYPE_ELEMENTAL]: 'elementals',
  [CREATURE_TYPE_FEY]: 'fey',
  [CREATURE_TYPE_FIEND]: 'fiends',
  [CREATURE_TYPE_GIANT]: 'giants',
  [CREATURE_TYPE_HUMANOID]: 'humanoids',
  [CREATURE_TYPE_MONSTROSITY]: 'monstrosities',
  [CREATURE_TYPE_OOZE]: 'oozes',
  [CREATURE_TYPE_PLANT]: 'plants',
  [CREATURE_TYPE_UNDEAD]: 'undead'
}

export default {
  CREATURE_TYPES: mapify(RAW_CREATURE_TYPES)
}
