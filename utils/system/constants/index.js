// eslint-disable-next-line no-unused-vars
import mapify from './mapify'
import abbreviations from './abbreviations'
import singulars from './singulars'

import abilities from './abilities'
import cr from './cr'
import skills from './skills'
import languages from './languages'
import sizes from './sizes'
import sources from './sources'

export const ABBREVIATION_TO_FULL = abbreviations
export const SINGULAR_TO_PLURAL = singulars

export const ABILITIES = abilities
export const CR = cr
export const SKILLS = skills
export const LANGUAGES = languages
export const SIZES = sizes
export const SOURCES = sources

export default {
  ABILITIES,
  CR,
  SKILLS,
  LANGUAGES,
  SIZES,
  SOURCES
}
