import mapify from './mapify'

export const LIST_LANGUAGES_STANDARD = ['Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc']

export const LIST_LANGUAGES_EXOTIC = [
  'Abyssal',
  'Celestial',
  'Draconic',
  'Deep',
  'Infernal',
  'Primordial',
  'Sylvan',
  'Undercommon'
]

export const LIST_LANGUAGES_SECRET = ['Druidic', "Thieves' cant"]

export const LIST_LANGUAGES = [...LIST_LANGUAGES_STANDARD, ...LIST_LANGUAGES_EXOTIC, ...LIST_LANGUAGES_SECRET]

export const RAW_CLASSIFICATION = {
  ...LIST_LANGUAGES_STANDARD.reduce((obj, cur) => ({ ...obj, [cur.toLowerCase()]: 'standard' }), {}),
  ...LIST_LANGUAGES_EXOTIC.reduce((obj, cur) => ({ ...obj, [cur.toLowerCase()]: 'exotic' }), {}),
  ...LIST_LANGUAGES_SECRET.reduce((obj, cur) => ({ ...obj, [cur.toLowerCase()]: 'secret' }), {})
}

export default {
  LANGUAGE_TO_CLASSIFICATION: mapify(RAW_CLASSIFICATION),
  LIST_LANGUAGES,
  LIST_LANGUAGES_STANDARD,
  LIST_LANGUAGES_EXOTIC,
  LIST_LANGUAGES_SECRET
}
