import mapify from './mapify'

export const LIST_ABBREVIATIONS = ['B', 'D', 'SD', 'T', 'U']

export const RAW_FULL_NAMES = {
  B: 'blindsight',
  D: 'darkvision',
  SD: 'superior darkvision',
  T: 'tremorsense',
  U: 'truesight'
}

export default {
  ABBREVIATION_TO_FULL: mapify(RAW_FULL_NAMES),
  LIST_ABBREVIATIONS
}
