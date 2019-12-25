import mapify from './mapify'

export const LIST_SKILLS = [
  'athletics',
  'acrobatics',
  'sleight of hand',
  'stealth',
  'arcana',
  'history',
  'investigation',
  'nature',
  'religion',
  'animal handling',
  'insight',
  'medicine',
  'perception',
  'survival',
  'deception',
  'intimidation',
  'performance',
  'persuasion'
]

export const RAW_ABILITY_ABBREVIATIONS = {
  athletics: 'str',
  acrobatics: 'dex',
  'sleight of hand': 'dex',
  stealth: 'dex',
  arcana: 'int',
  history: 'int',
  investigation: 'int',
  nature: 'int',
  religion: 'int',
  'animal handling': 'wis',
  insight: 'wis',
  medicine: 'wis',
  perception: 'wis',
  survival: 'wis',
  deception: 'cha',
  intimidation: 'cha',
  performance: 'cha',
  persuasion: 'cha'
}

export const RAW_SHORT = {
  athletics: 'ath',
  acrobatics: 'acro',
  'sleight of hand': 'soh',
  stealth: 'slth',
  arcana: 'arc',
  history: 'hist',
  investigation: 'invn',
  nature: 'natr',
  religion: 'reli',
  'animal handling': 'hndl',
  insight: 'ins',
  medicine: 'med',
  perception: 'perp',
  survival: 'surv',
  deception: 'decp',
  intimidation: 'intm',
  performance: 'perf',
  persuasion: 'pers'
}

export default {
  FULL_TO_ABILITY_ABBREVIATION: mapify(RAW_ABILITY_ABBREVIATIONS),
  FULL_TO_SHORT: mapify(RAW_SHORT),
  LIST_SKILLS
}
