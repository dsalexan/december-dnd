import _ from 'lodash'
import uuid from 'uuid/v4'

import { CreatureTypeText, CreatureLevelText, CreatureCRText } from './parser'
import { modifier, SKILLS, proficiency_modifier } from '~/domain/system'
import * as Rolls from '@/utils/rolls'

import * as Schemas from '~/schema/december/character'
import { sort } from '~/utils/sort'
import CR from '~/domain/system/cr'
import { isValid, int, sum } from '~/utils/value'
import { levelToPb } from '~/domain/system/level'
import alignment from '~/domain/system/alignment'

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
 * @param  {Integer[]} rolls Map of rolls
 * @param  {String} name='initiative'
 * @return {Boolean} Confirms if roll value in character object is valid
 */
export function hasRolled(rolls, name = 'initiative') {
  const roll = rolls[name]
  if (!Rolls.isValid(roll)) {
    return false
  }

  return true
}

/**
 * Get character initiative value (with roll if it exists)
 * @param {Character} character
 * @returns {Number} Roll + DEX | DEX (if there is no roll)
 */
export function initiative(character) {
  if (!hasRolled(character._rolls)) {
    return modifier(character.dex)
  }

  return parseInt(character._rolls.initiative) + modifier(character.dex)
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
  return CreatureCRText(character.cr)
}

/**
 * Generic value and text for level or cr of a character/creature
 * @param {Character} character
 * @returns {String} Level/CR { value, display }
 */
export function creatureLevelCR(character) {
  if (character.level !== undefined) {
    return { level: true, value: parseInt(character.level) || undefined, display: creatureLevelText(character) }
  } else {
    return { cr: true, value: CR.toNumber(character), display: creatureCRText(character) }
  }
}

/**
 * Sum total level of creature
 * @param {Character} character
 * @returns {Number} Total character level
 */
export function creatureLevel(character, fallback) {
  let { level } = character

  if (level === undefined) return fallback

  if (!_.isArray(level)) {
    level = [level]
  }

  return level.reduce((sum, cur) => sum + cur.level, 0)
}

/**
 * Generic value and text for level or cr of a character/creature
 * @param {Character} character
 * @param {Boolean} string Defines if return is string (e.g. +3) or just numeric value (e.g. 3)
 * @returns {String, Integer} Proficiency Bonus
 */
export function creatureProficiencyBonus(character, string = false) {
  let bonus = 0
  if (character.level !== undefined) {
    bonus = levelToPb(creatureLevel(character))
  } else {
    bonus = CR.toProficiencyBonus(character)
  }

  return string ? (bonus >= 0 ? `+${bonus}` : `${bonus}`) : bonus
}

export function allImmunitiesAndResistances(toParse, key) {
  function recurse(it) {
    if (typeof it === 'string') {
      out.push(it)
    } else if (it[key]) {
      it[key].forEach((nxt) => recurse(nxt))
    }
  }
  const out = []
  toParse.forEach((it) => {
    recurse(it)
  })
  return out
}

export function characterSavingThrowBonus(mon, save, string = true, fallback = undefined) {
  const value = proficiency_modifier((mon.save || {})[save], creatureProficiencyBonus(mon), mon[save], string)
  if (value === undefined) return fallback
  return value
}

export function characterSkillBonus(mon, skill, string = true, fallback = undefined) {
  const ability = SKILLS._.FULL_TO_ABILITY_ABBREVIATION.A(skill)
  const value = proficiency_modifier((mon.skill || {})[skill], creatureProficiencyBonus(mon), mon[ability], string)
  if (value === undefined) return fallback
  return value
}

// factory
export function make(char, _id) {
  // NAME
  if (char.name === undefined) {
    throw new Error('Undefined name')
  }

  // SOURCE
  if (char.source === undefined) {
    char.source = 'UNK'
  }

  // TYPE
  if (char.type === undefined || char.type === null || (!_.isString(char.type) && !_.isObjectLike(char.type))) {
    char.type = 'Unknown'
  } else if (_.isObjectLike(char.type)) {
    if (char.type.type === undefined || char.type.type === null) {
      char.type.type = 'Unknown'
    }

    if (char.type.tags === undefined || char.type.tags === null) {
      char.type = char.type.type
    }
  }

  char.__pTypes = char.__pTypes || CreatureTypeText(char.type)

  // LEVEL / CR
  const hasLevel = char.level !== undefined && char.level !== null
  const hasCR = char.cr !== undefined && char.cr !== null

  if (!hasLevel && !hasCR) {
    // throw new Error('Character doesnt have CR or Level')
    char.__fCrLevel = {
      value: undefined,
      display: '\u2014'
    }
  } else {
    if (hasLevel) {
      // remove empty properties
      for (let i = 0; i < char.level.length; i++) {
        for (const key of ['class', 'subclass']) {
          if (char.level[i][key] !== undefined) {
            if (char.level[i][key].name === undefined && char.level[i][key].source === undefined) {
              delete char.level[i][key]
            }
          }
        }
      }

      const level_validation = Schemas.level(char.level)
      if (!level_validation.valid) {
        throw level_validation.errors[0]
      }

      char._fLevel = creatureLevel(char)
      char._fLevelAsText = creatureLevelText(char)
    }

    if (hasCR) {
      const cr_validation = Schemas.cr(char.cr)
      if (!cr_validation.valid) {
        throw cr_validation.errors[0]
      }

      char.__pCr = char.__pCr || (char.cr == null ? null : char.cr.cr || char.cr)
    }

    char.__fCrLevel = creatureLevelCR(char)
  }

  // ABILITY SCORE
  if (
    char.str === undefined ||
    char.dex === undefined ||
    char.con === undefined ||
    char.int === undefined ||
    char.wis === undefined ||
    char.cha === undefined
  ) {
    throw new Error('Incorrect ability properties')
  }

  // SPEED
  if (char.speed === undefined) char.speed = {}

  char.___fSpeedType = Object.keys(char.speed).filter((k) => char.speed[k])
  if (char.___fSpeedType.length)
    // eslint-disable-next-line prefer-destructuring
    char.__fSpeed = char.___fSpeedType.map((k) => char.speed[k].number || char.speed[k]).sort((a, b) => sort(a, b))[0]
  else char.__fSpeed = 0
  if (char.speed.canHover) char.___fSpeedType.push('hover')

  // AC
  if (char.ac === undefined) char.ac = []

  char.__fAc = char.ac.map((it) => it.ac || it)

  // HP
  if (char.hp === undefined) char.hp = { average: 'Unknown' }

  if (char.hp.average) {
    char.__fHp = char.hp.average
    char.__fMaximumHp = int(char.__fHp, undefined) // set maximum HP as the average per now
    // TODO: implement something to change between average, minimum and maximum hp at tracker
  } else if (char.hp.rolls) {
    // hp doesnt have average, so is a character with proper value
    char.__fMaximumHp = sum(char.hp.rolls, sum(char.hp.bonus))
    char.__fHp = char.__fMaximumHp
  }

  // SIZE
  if (char.size) {
    char.size = [char.size].flat(1)
    char.__fSize = char.size.map((s) => s.size || s)
  }

  // ALIGNMENT
  if (char.alignment) {
    const constAlignment =
      typeof char.alignment[0] === 'object'
        ? Array.prototype.concat.apply(
            [],
            char.alignment.map((a) => a.alignment)
          )
        : [...char.alignment]

    const tempAlign = _.cloneDeep(constAlignment)
    if (tempAlign.length === 1 && tempAlign.includes('N')) Array.prototype.push.apply(tempAlign, ['NX', 'NY'])
    else if (tempAlign.includes('N') && !tempAlign.includes('L') && !tempAlign.includes('C')) tempAlign.push('NX')
    else if (tempAlign.includes('N') && !tempAlign.includes('G') && !tempAlign.includes('E')) tempAlign.push('NY')

    char.__fAlign = tempAlign
    char.__tAlignment = alignment.abbreviationToFull(constAlignment).join(' ')
  } else {
    char.__fAlign = null
    char.__tAlignment = null
  }

  // OTHERS
  char.__fVuln = char.vulnerable ? allImmunitiesAndResistances(char.vulnerable, 'vulnerable') : []
  char.__fRes = char.resist ? allImmunitiesAndResistances(char.resist, 'resist') : []
  char.__fImm = char.immune ? allImmunitiesAndResistances(char.immune, 'immune') : []
  char.__fCondImm = char.conditionImmune ? allImmunitiesAndResistances(char.conditionImmune, 'conditionImmune') : []
  char.__fSave = char.save ? Object.keys(char.save) : []
  char.__fSkill = char.skill ? Object.keys(char.skill) : []
  char.__fSources = char.otherSources ? [char.source].concat(char.otherSources.map((src) => src.source)) : char.source

  // _ROLLS
  if (char._rolls === undefined || char._rolls === null || !_.isObjectLike(char._rolls)) {
    char._rolls = Rolls.types.reduce((obj, cur) => {
      if (!(cur in obj)) {
        obj[cur] = undefined
      }
      return obj
    }, char._rolls || {})
  }

  // _HP
  if (!isValid(char._hp) || !_.isObjectLike(char._hp)) {
    const default_hp_key = 'current'

    const hp = {
      current: undefined, // just a number, should reflect total otherwise
      temporary: undefined, // usually 0
      total: int(char.__fMaximumHp, undefined) // usualy SUM(hp.maximum), but its here for any bonusus/onusus
    }
    if (!_.isObjectLike(char._hp)) {
      hp[default_hp_key] = int(char._hp, hp.total)
    }

    char._hp = hp
  }

  if (char._hp.total === undefined) char._hp.total = char.__fMaximumHp
  if (char._hp.temporary === undefined) char._hp.temporary = 0
  if (char._hp.current === undefined) char._hp.current = char._hp.total
  if (char._hp.death_saving_throw === undefined) char._hp.death_saving_throw = [false, false, false, false, false]

  // CONDITIONS
  if (!isValid(char._conditions) || !_.isObjectLike(char._conditions)) {
    char._conditions = []
  }

  // FEATS

  // _ID
  if (!isValid(char._id) || isValid(_id)) char._id = _id || `${char.source.toLowerCase()}--${uuid().substr(0, 9)}`

  // MAKE PROCESS VALIDATOR
  if (!('__character' in char)) char.__character = true

  return char
}

export function simplify(char) {
  return Object.keys(char).reduce((obj, key) => {
    if (key.slice(0, 2) === '__') return obj
    return { ...obj, [key]: char[key] }
  }, {})
}

export default {
  // status
  hasRolled,
  // properties
  initiative,
  creatureLevelText,
  creatureLevel,
  creatureCRText,
  creatureLevelCR,
  characterSkillBonus,
  characterSavingThrowBonus,
  creatureProficiencyBonus,
  // factory
  make
}
