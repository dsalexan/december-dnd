import mapify from './mapify'

export const LIST_ABBREVIATIONS = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const RAW_ABBREVIATIONS = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma'
}

export const LIST_ABILITIES = Object.values(RAW_ABBREVIATIONS)

export default {
  ABBREVIATIONS_TO_FULL: mapify(RAW_ABBREVIATIONS),
  LIST_ABILITIES,
  LIST_ABBREVIATIONS
}
