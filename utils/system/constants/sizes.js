import mapify from './mapify'

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

export const LIST_ABBREVIATIONS = [SIZE_TINY, SIZE_SMALL, SIZE_MEDIUM, SIZE_LARGE, SIZE_HUGE, SIZE_GARGANTUAN, SIZE_VARIES]

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

export const LIST_SIZES = Object.values(RAW_SIZES)

export default {
  ABBREVIATION_TO_FULL: mapify(RAW_SIZES),
  LIST_ABBREVIATIONS,
  LIST_SIZES,
  SIZE_FINE,
  SIZE_DIMINUTIVE,
  SIZE_TINY,
  SIZE_SMALL,
  SIZE_MEDIUM,
  SIZE_LARGE,
  SIZE_HUGE,
  SIZE_GARGANTUAN,
  SIZE_COLOSSAL,
  SIZE_VARIES
}
