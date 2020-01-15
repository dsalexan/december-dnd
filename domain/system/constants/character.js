import mapify from './mapify'

export const TYPES = {
  ABERRATION: 'aberration',
  BEAST: 'beast',
  CELESTIAL: 'celestial',
  CONSTRUCT: 'construct',
  DRAGON: 'dragon',
  ELEMENTAL: 'elemental',
  FEY: 'fey',
  FIEND: 'fiend',
  GIANT: 'giant',
  HUMANOID: 'humanoid',
  MONSTROSITY: 'monstrosity',
  OOZE: 'ooze',
  PLANT: 'plant',
  UNDEAD: 'undead'
}

export const LIST_TYPES = [
  TYPES.ABERRATION,
  TYPES.BEAST,
  TYPES.CELESTIAL,
  TYPES.CONSTRUCT,
  TYPES.DRAGON,
  TYPES.ELEMENTAL,
  TYPES.FEY,
  TYPES.FIEND,
  TYPES.GIANT,
  TYPES.HUMANOID,
  TYPES.MONSTROSITY,
  TYPES.OOZE,
  TYPES.PLANT,
  TYPES.UNDEAD
]

export const RAW_PLURALS = {
  [TYPES.ABERRATION]: 'aberrations',
  [TYPES.BEAST]: 'beasts',
  [TYPES.CELESTIAL]: 'celestials',
  [TYPES.CONSTRUCT]: 'constructs',
  [TYPES.DRAGON]: 'dragons',
  [TYPES.ELEMENTAL]: 'elementals',
  [TYPES.FEY]: 'fey',
  [TYPES.FIEND]: 'fiends',
  [TYPES.GIANT]: 'giants',
  [TYPES.HUMANOID]: 'humanoids',
  [TYPES.MONSTROSITY]: 'monstrosities',
  [TYPES.OOZE]: 'oozes',
  [TYPES.PLANT]: 'plants',
  [TYPES.UNDEAD]: 'undead'
}

export const RAW_MISC = {
  AOE: 'Has Areas of Effect',
  MW: 'Has Melee Weapon Attacks',
  RW: 'Has Ranged Weapon Attacks',
  RNG: 'Has Ranged Weapons',
  RCH: 'Has Reach Attacks',
  THW: 'Has Thrown Weapons'
}

export const LIST_MISC = Object.keys(RAW_MISC)

export default {
  TYPE_SINGULAR_TO_PLURAL: mapify(RAW_PLURALS),
  MISC_ABBREVIATION_TO_FULL: mapify(RAW_MISC),
  LIST_MISC,
  LIST_TYPES,
  TYPES
}
