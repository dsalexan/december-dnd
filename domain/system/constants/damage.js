import mapify from './mapify'

export const LIST_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder'
]

export const LIST_ABBREVIATIONS = ['A', 'B', 'C', 'F', 'O', 'L', 'N', 'P', 'I', 'Y', 'R', 'S', 'T']

export const RAW_FULL_NAMES = {
  A: 'acid',
  B: 'bludgeoning',
  C: 'cold',
  F: 'fire',
  O: 'force',
  L: 'lightning',
  N: 'necrotic',
  P: 'piercing',
  I: 'poison',
  Y: 'psychic',
  R: 'radiant',
  S: 'slashing',
  T: 'thunder'
}

export default {
  LIST_ABBREVIATIONS,
  LIST_TYPES,
  ABBREVIATION_TO_FULL: mapify(RAW_FULL_NAMES)
}
