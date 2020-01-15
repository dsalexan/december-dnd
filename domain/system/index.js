import _ from 'lodash'

import { int, bool, isValid } from '../../utils/value'
import { warn } from '../../utils/debug'
import cr from './cr'
import xp from './xp'
import level from './level'
import abilities from './abilities'
import skills from './skills'
import senses from './senses'
import units from './units'

import constants from './constants'

export function signal(value) {
  if (int(value, undefined) !== undefined) {
    return `${int(value) > 0 ? '+' : ''}${int(value)}`
  }

  return value
}

export function modifier(value, string = false) {
  const mod = Math.floor((value - 10) / 2)
  if (!string) return mod

  return mod >= 0 ? '+' + mod : mod
}

/**
 * Returns Proficient modifier for a specific proficiency
 * @param {*} proficiency Proficiency Object, (ratio, bonus OR true OR string [e.g. +5])
 * @param {*} proficiency_bonus
 * @param {*} ability
 */
export function proficiency_modifier(proficiency, proficiency_bonus, ability, string = false) {
  let ratio = 0
  let bonus = 0
  const ability_modifier = modifier(ability)

  if (bool(proficiency) !== undefined) ratio = +bool(proficiency)
  else if (_.isString(proficiency)) bonus = int(proficiency)
  else if (_.isObjectLike(proficiency)) {
    ratio = proficiency.ratio || 0
    bonus = proficiency.bonus || 0
  } else if (!isValid(proficiency)) {
    ratio = 0
    bonus = 0
  } else {
    warn('proficiency_modifier', 'Not implemented variable type for skill value', typeof proficiency, proficiency)
    return signal(proficiency)
  }

  const proficiencyModifier = ability_modifier + Math.floor(proficiency_bonus * ratio) + bonus

  return string ? `${proficiencyModifier > 0 ? '+' : ''}${proficiencyModifier}` : proficiencyModifier
}

export const CR = cr
export const XP = xp
export const LEVEL = level
export const ABILITIES = abilities
export const SKILLS = skills
export const SENSES = senses

export const UNITS = units

export default {
  modifier,
  CR,
  XP,
  LEVEL,
  ABILITIES,
  SKILLS,
  SENSES,
  UNITS,
  _: constants
}
