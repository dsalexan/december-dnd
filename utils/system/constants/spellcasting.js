import mapify from './mapify'

export const LIST_ABBREVIATIONS = ['F', 'I', 'P', 'S', 'CB', 'CC', 'CD', 'CP', 'CR', 'CS', 'CL', 'CW']

export const RAW_FULL = {
  P: 'Psionics',
  I: 'Innate',
  F: 'Form Only',
  S: 'Shared',
  CB: 'Class, Bard',
  CC: 'Class, Cleric',
  CD: 'Class, Druid',
  CP: 'Class, Paladin',
  CR: 'Class, Ranger',
  CS: 'Class, Sorcerer',
  CL: 'Class, Warlock',
  CW: 'Class, Wizard'
}

export default {
  ABBREVIATIONS_TO_FULL: mapify(RAW_FULL),
  LIST_ABBREVIATIONS
}
