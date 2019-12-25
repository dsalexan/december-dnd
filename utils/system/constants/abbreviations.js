import mapify from './mapify'

export const LIST_ATTRIBUTES = ['str', 'dex', 'con', 'int', 'wis', 'cha']
export const RAW_ATTRIBUTES = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma'
}

export const SIZE_FINE = 'F'
export const SIZE_DIMINUTIVE = 'D'
export const SIZE_TINY = 'T'
export const SIZE_SMALL = 'S'
export const SIZE_MEDIUM = 'M'
export const SIZE_LARGE = 'L'
export const SIZE_HUGE = 'H'
export const SIZE_GARGANTUAN = 'G'
export const SIZE_COLOSSAL = 'C'
export const SIZE_VARIES = 'V'
export const LIST_SIZES = [SIZE_TINY, SIZE_SMALL, SIZE_MEDIUM, SIZE_LARGE, SIZE_HUGE, SIZE_GARGANTUAN, SIZE_VARIES]
export const RAW_SIZES = {
  [SIZE_FINE]: 'Fine',
  [SIZE_DIMINUTIVE]: 'Diminutive',
  [SIZE_TINY]: 'Tiny',
  [SIZE_SMALL]: 'Small',
  [SIZE_MEDIUM]: 'Medium',
  [SIZE_LARGE]: 'Large',
  [SIZE_HUGE]: 'Huge',
  [SIZE_GARGANTUAN]: 'Gargantuan',
  [SIZE_COLOSSAL]: 'Colossal',
  [SIZE_VARIES]: 'Varies'
}

export default {
  ATTRIBUTES: mapify(RAW_ATTRIBUTES),
  SIZES: mapify(RAW_SIZES)
}
