import _ from 'lodash'

import { CreatureTypeText, CreatureLevelText, CreatureCRText } from './parser'
import { modifier } from '@/utils/system'
import * as Rolls from '@/utils/rolls'

import * as Schemas from '@/schemas/character'

/**
 * @typedef {Object} Character
 * @property {String} name
 * @property {String} source
 * @property {Object} type
 * @property {String} avatar
 * @property {Object} ability
 * @property {Object} _rolls
 */

// states
/**
 * Informs if a specific roll was made by the character
 * @param  {Character} character
 * @param  {String} name='initiative'
 * @return {Boolean} Confirms if roll value in character object is valid
 */
export function hasRolled(character, name = 'initiative') {
  const roll = character._rolls[name]
  if (!Rolls.isValid(roll)) {
    return false
  }

  return true
}

// properties
/**
 * Get ability score of character
 * @param {Character} character
 * @param {String} name='dex' Ability name
 * @returns {Number} Ability score value
 */
export function abilityScore(character, name = 'dex') {
  return parseInt(character.ability[name])
}

/**
 * Get character initiative value (with roll if it exists)
 * @param {Character} character
 * @returns {Number} Roll + DEX | DEX (if there is no roll)
 */
export function initiative(character) {
  if (!hasRolled(character)) {
    return modifier(abilityScore(character, 'dex'))
  }

  return parseInt(character._rolls.initiative) + modifier(abilityScore(character, 'dex'))
}

// /**
//  * Parses creature type to text
//  * @param {Character} character
//  * @returns {String} Creature type text
//  */
// export function creatureTypeText(character) {
//   return CreatureTypeText(character.type).asText
// }

/**
 * Parses creature level to text
 * @param {Character} character
 * @returns {String} Creature level text
 */
export function creatureLevelText(character) {
  return CreatureLevelText(character.level)
}

/**
 * Parses creature CR to text
 * @param {Character} character
 * @returns {String} Creature cr text
 */
export function creatureCRText(character) {
  return CreatureCRText(character.level)
}

/**
 * Generic text for level or cr of a character/creature
 * @param {Character} character
 * @returns {String} Level/CR text
 */
export function creatureLevelCRText(character) {
  if (character.level !== undefined) {
    return creatureLevelText(character)
  } else {
    return creatureCRText(character)
  }
}

/**
 * Sum total level of creature
 * @param {Character} character
 * @returns {Number} Total character level
 */
export function creatureLevel(character) {
  let level = character.level
  if (!_.isArray(level)) {
    level = [level]
  }

  return level.reduce((sum, cur) => sum + cur.level, 0)
}

// factory
export function make({
  name,
  source,
  type,
  background = undefined,
  level,
  cr,
  avatar = undefined,
  ability = undefined,
  _rolls = undefined
} = {}) {
  // NAME
  if (name === undefined) {
    throw new Error('Undefined name')
  }

  // SOURCE
  if (source === undefined) {
    source = 'Unknown'
  }

  // TYPE
  if (type === undefined || type === null || (!_.isString(type) && !_.isObjectLike(type))) {
    type = 'Unknown'
  } else if (_.isObjectLike(type)) {
    if (type.type === undefined || type.type === null) {
      type.type = 'Unknown'
    }

    if (type.tags === undefined || type.tags === null) {
      type = type.type
    }
  }

  type = CreatureTypeText(type)

  // LEVEL / CR
  const hasLevel = level !== undefined && level !== null
  const hasCR = cr !== undefined && cr !== null

  if (!hasLevel && !hasCR) throw new Error('Character doesnt have CR or Level')

  if (hasLevel) {
    // remove empty properties
    for (let i = 0; i < level.length; i++) {
      for (const key of ['class', 'subclass']) {
        if (level[i][key] !== undefined) {
          if (level[i][key].name === undefined && level[i][key].source === undefined) {
            delete level[i][key]
          }
        }
      }
    }

    const level_validation = Schemas.level(level)
    if (!level_validation.valid) {
      throw level_validation.errors[0]
    }
  }

  if (hasCR) {
    const cr_validation = Schemas.cr(cr)
    if (!cr_validation.valid) {
      throw cr_validation.errors[0]
    }
  }

  // ABILITY SCORE
  if (ability === undefined || Object.keys(ability).length !== 6) {
    throw new Error('Incorrect ability object')
  }
  // if (ability === undefined) {
  //   ability = {}
  // }
  // if (Object.keys(ability).length !== 6) {
  //   for (name of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
  //     if (!(name in ability)) {
  //       ability[name] =
  //     }
  //   }
  // }

  // _ROLLS
  if (_rolls === undefined || _rolls === null || !_.isObjectLike(_rolls)) {
    _rolls = {}
  }

  // _ID
  const _id = name + source

  // CHARACTER
  const character = {
    _id,
    name,
    source,
    type,
    background,
    level,
    cr,
    avatar,
    ability,
    _rolls: Rolls.types.reduce((obj, cur) => {
      if (!(cur in obj)) {
        obj[cur] = undefined
      }
      return obj
    }, _rolls)
  }

  return character
}

export default {
  // status
  hasRolled,
  // properties
  abilityScore,
  initiative,
  creatureLevelText,
  creatureLevel,
  creatureCRText,
  creatureLevelCRText,
  // factory
  make
}
