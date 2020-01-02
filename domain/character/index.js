import _ from 'lodash'
import uuid from 'uuid/v4'

import { CreatureTypeText, CreatureLevelText, CreatureCRText } from './parser'
import { modifier, SKILLS, proficiency_modifier } from '@/utils/system'
import * as Rolls from '@/utils/rolls'

import * as Schemas from '@/schemas/character'
import { sort as ascSort, compareListNames, sortCR, sort, sortAbilities } from '~/utils/sort'
import CR from '~/utils/system/cr'
import { isValid, int, sum } from '~/utils/value'
import { render, stringToValueObject } from '~/services/renderer'
import { levelToPb } from '~/utils/system/level'

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
  let level = character.level

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

export function sortCharacters(_a, _b, { sortBy }) {
  const a = _a.data || _a
  const b = _b.data || _b

  if (sortBy === 'count') return ascSort(a.count, b.count) || compareListNames(a, b)
  switch (sortBy) {
    case 'name':
      return compareListNames(a, b)
    case 'type':
      return ascSort(a.type.asText, b.type.asText) || compareListNames(a, b)
    case 'source':
      return ascSort(a.source, b.source) || compareListNames(a, b)
    case 'cr':
      return sortCR(a.cr || creatureLevel(a), b.cr || creatureLevel(b)) || compareListNames(a, b)
  }
}

export function speedToArray(it_speed) {
  // look to getSpeedString
  if (!isValid(it_speed) || Object.keys(it_speed).length === 0) return []

  const displayFn = (v) => `${v} ft.`

  function procSpeed(propName) {
    function addSpeed(s) {
      // stack.push(`${propName === 'walk' ? '' : `${propName} `}${getVal(s)} ft.${getCond(s)}`)
      stack.push({
        key: propName,
        label: propName,
        value: getVal(s),
        tooltip: getCond(s),
        display: {
          label: propName === 'walk' ? '' : propName,
          value: displayFn(getVal(s))
        },
        source: s
      })
    }

    if (it_speed[propName] || propName === 'walk') addSpeed(it_speed[propName] || 0)
    if (it_speed.alternate && it_speed.alternate[propName]) it_speed.alternate[propName].forEach(addSpeed)
  }

  function getVal(speedProp) {
    return speedProp.number != null ? speedProp.number : speedProp
  }

  function getCond(speedProp) {
    return speedProp.condition ? render(speedProp.condition) : undefined
  }

  const stack = []
  if (typeof it_speed === 'object') {
    // let joiner = ', '
    procSpeed('walk')
    procSpeed('burrow')
    procSpeed('climb')
    procSpeed('fly')
    procSpeed('swim')
    if (it_speed.choose) {
      // joiner = '; '
      stack.push(
        `${it_speed.choose.from.sort().joinConjunct(', ', ' or ')} ${it_speed.choose.amount} ft.${
          it_speed.choose.note ? ` ${it_speed.choose.note}` : ''
        }`
      )
    }

    return stack
    // return stack.join(joiner)
  } else {
    // return it_speed + (it_speed === 'Varies' ? '' : ' ft. ')
    return {
      value: it_speed,
      display: it_speed === 'Varies' ? displayFn(it_speed) : it_speed
    }
  }
}

export function acToArray(ac) {
  // look to acToFull in 5eTools
  if (typeof ac === 'string') return ac // handle classic format

  return ac.map((cur) => {
    return {
      value: cur.ac,
      tooltip: cur.from.map((it) => render(it)),
      source: cur
      // TODO: How to deal with condition here?
    }
  })
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

export function skillsToArray(mon) {
  // look to getSkillsString
  // function makeSkillRoller(name, mod) {
  //   return render(`{@d20 ${mod}|${mod}|${name}`)
  // }

  function doSortMapJoinSkillKeys(obj = {}, keys, joinWithOr) {
    const toJoin = keys.sort(sort).map((s) => {
      // TODO: Implement skill roller
      // return `<span data-mon-skill="${s.toTitleCase()}|${obj[s]}">${render(`{@skill ${s.toTitleCase()}}`)} ${makeSkillRoller(
      //   s.toTitleCase(),
      //   obj[s]
      // )}</span>`
      return {
        key: s,
        label: s.toTitleCase(),
        value: obj[s],
        display: {
          value: characterSkillBonus(mon, s, true)
        },
        source: obj[s]
      }
    })
    // return joinWithOr ? toJoin.joinConjunct(', ', ' or ') : toJoin.join(', ')
    return toJoin
  }

  const skills = doSortMapJoinSkillKeys(
    mon.skill,
    Object.keys(mon.skill || {}).filter((k) => k !== 'other' && k !== 'special' && isValid(mon.skill[k]))
  )

  if (mon.skill && (mon.skill.other || mon.skill.special)) {
    const others =
      mon.skill.other &&
      mon.skill.other.map((it) => {
        if (it.oneOf) {
          return `plus one of the following: ${doSortMapJoinSkillKeys(it.oneOf, Object.keys(it.oneOf), true)}`
        }
        throw new Error(`Unhandled monster "other" skill properties!`)
      })
    const special = mon.skill.special && render(mon.skill.special)
    return [skills, others, special].filter(Boolean).join(', ')
  } else return skills
}

export function savesToArray(mon) {
  // look to getSavesPart
  // return `${Object.keys(mon.save)
  //   .sort(sortAbilities)
  //   .map((s) => Renderer.monster.getSave(Renderer.get(), s, mon.save[s]))
  //   .join(', ')}`
  return Object.keys(mon.save || {})
    .filter((save) => isValid(mon.save[save]))
    .sort(sortAbilities)
    .map((s) => {
      return {
        key: s,
        label: s.toTitleCase(),
        value: mon.save[s],
        display: {
          value: characterSavingThrowBonus(mon, s, true)
        },
        source: mon.save[s]
      }
    })
}

export function sensesToArray(mon) {
  // look to getSensesPart
  const displayFn = (v) => `${v} ft.`

  function getRenderedSenses(senses, isPlainText) {
    if (typeof senses === 'string') senses = [senses] // handle legacy format
    if (isPlainText) return senses.join(', ')
    const senseStr = senses.map((s) => {
      if (_.isString(s)) {
        let _s = s.replace(
          /(^| |\()(tremorsense|blindsight|truesight|darkvision)(\)| |$)/gi,
          (...m) => `${m[1]}{@sense ${m[2]}}${m[3]}`
        )
        _s = _s.replace(/(^| |\()(blind|blinded)(\)| |$)/gi, (...m) => `${m[1]}{@condition blinded||${m[2]}}${m[3]}`)

        return [...stringToValueObject(_s, true), _s]
      } else {
        return [s, {}, s]
      }
    })

    return senseStr.map(([object, directive, source]) => {
      if (_.isString(object)) {
        return [render(object), source]
      } else {
        const rendered = {
          name: render(object.name),
          value: object.value,
          condition: render(object.condition)
        }

        return [
          {
            label: rendered.name,
            value: rendered.value,
            tooltip: rendered.condition,
            displayFn: directive.displayFn ? directive.displayFn : _.isNumber(rendered.value) ? displayFn : undefined
          },
          source
        ]
      }
    })
  }

  // return `${mon.senses ? `${getRenderedSenses(mon.senses)}, ` : ''}passive Perception ${mon.passive || '\u2014'}`
  const passivePerception = characterSkillBonus(mon, 'perception', false, 0) + 10
  return [
    ...(mon.senses ? getRenderedSenses(mon.senses) : []).map(([s, source], index) => {
      return {
        key: index,
        label: s.label,
        value: s.value || s,
        tooltip: s.tooltip,
        display: {
          value: (s.displayFn && s.displayFn(s.value || s)) || s.value || s
        },
        source,
        shouldRewrite: s.shouldRewrite
      }
    }),
    {
      key: 'passive',
      label: 'Passive Perception',
      value: passivePerception,
      editable: {
        value: false,
        template: true
      },
      removable: false,
      source: (mon.skill || {}).perception,
      template: [
        true,
        {
          proficiency_ratio: 1.1,
          bonus: 1
        }
      ]
    }
  ]
}

export function languagesToArray(languages) {
  // look to getRenderedLanguages
  if (typeof languages === 'string') languages = [languages] // handle legacy format
  return (languages || []).map((l, index) => ({
    key: index,
    value: l,
    source: l
  }))
  // return languages ? languages.join(', ') : '\u2014'
}
export function immunitiesAndResistancesToArray(toParse = []) {
  // look to monImmResToFull
  const outerLen = toParse.length
  let maxDepth = 0
  if (outerLen === 1 && (toParse[0].immune || toParse[0].resist)) {
    return toParse.map((it) => toString(it, -1)).join(maxDepth ? '; ' : ', ')
  }

  function toArray(index, it, depth = 0) {
    if (depth > 1) debugger
    maxDepth = Math.max(maxDepth, depth)
    if (typeof it === 'string') {
      return it
    } else if (it.special !== undefined) {
      return it.special
    } else {
      const prop = it.immune ? 'immune' : it.resist ? 'resist' : it.vulnerable ? 'vulnerable' : null
      const value = prop ? it[prop].map((nxt, idx) => toArray(idx, nxt, depth + 1)) : []

      return value.map((subvalue, sv_index) => {
        return {
          key: [index, prop, subvalue.key || sv_index].flat(),
          value: subvalue,
          display: {
            value: `${it.preNote ? `${it.preNote} ` : ''}${subvalue}`
          },
          tooltip: it.note.uppercaseFirst()
        }
      })
    }
  }

  return toParse
    .map((it, index) => toArray(index, it))
    .map((value, index) => {
      if (_.isString(value)) {
        return {
          key: [index],
          value,
          display: {
            value: value.toTitleCase()
          }
        }
      }
      return value
    })
    .flat(Infinity)
    .map((obj) => ({
      ...obj,
      editable: false // TODO: ALLOW EDIT
    }))
}

export function conditionImmunitiesToArray(condImm = [], isPlainText) {
  function helper_render(condition) {
    return isPlainText ? condition : render(`{@condition ${condition}}`)
  }
  return condImm
    .map((it, index) => {
      if (it.special)
        return {
          key: index,
          value: it.special
        }
      if (it.conditionImmune) {
        const casd = it.conditionImmune.map((subitem, subindex) => {
          return {
            key: subindex,
            value: subitem,
            tooltip: it.note,
            display: {
              value: [...(it.preNote ? [it.preNote] : []), render(subitem)]
            }
          }
        })
        debugger
        return casd
        // eslint-disable-next-line max-len
        // return `${it.preNote ? `${it.preNote} ` : ''}${it.conditionImmune.map(render).join(', ')}${it.note ? ` ${it.note}` : ''}`
      }

      return {
        key: index,
        value: it,
        display: {
          value: helper_render(it)
        }
      }
    })
    .flat(Infinity)
    .map((obj) => ({
      ...obj,
      editable: false // TODO: ALLOW EDIT
    }))
    .sort((a, b) => sort(a.value, b.value))
}

export function conditionsToArray(conditions = [], isPlainText) {
  function helper_render(condition) {
    return isPlainText ? condition : render(`{@condition ${condition}}`)
  }
  return conditions
    .map((it, index) => {
      if (it.special)
        return {
          key: [index, 'special'],
          value: it.special
        }
      if (_.isObjectLike(it) && 'name' in it) {
        // is valueObject
        const casd = {
          key: index,
          value: it.name,
          label: it.value,
          tooltip: it.condition,
          display: {
            // determines how the properties are to be displayed
            value: helper_render(it.name), // could be a function
            label: it.value === undefined ? '' : it.value
          },
          source: it
        }
        return casd
        // eslint-disable-next-line max-len
        // return `${it.preNote ? `${it.preNote} ` : ''}${it.conditionImmune.map(render).join(', ')}${it.note ? ` ${it.note}` : ''}`
      }

      return {
        key: index,
        value: it,
        display: {
          value: helper_render(it)
        }
      }
    })
    .flat(Infinity)
    .sort((a, b) => sort(a.value, b.value))
}

// factory
export function make(char) {
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

  char._pTypes = char._pTypes || CreatureTypeText(char.type)

  // LEVEL / CR
  const hasLevel = char.level !== undefined && char.level !== null
  const hasCR = char.cr !== undefined && char.cr !== null

  if (!hasLevel && !hasCR) {
    // throw new Error('Character doesnt have CR or Level')
    char._fCrLevel = {
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

      char._pCr = char._pCr || (char.cr == null ? null : char.cr.cr || char.cr)
    }

    char._fCrLevel = creatureLevelCR(char)
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

  char._fSpeedType = Object.keys(char.speed).filter((k) => char.speed[k])
  if (char._fSpeedType.length)
    char._fSpeed = char._fSpeedType.map((k) => char.speed[k].number || char.speed[k]).sort((a, b) => sort(a, b))[0]
  else char._fSpeed = 0
  if (char.speed.canHover) char._fSpeedType.push('hover')

  // AC
  if (char.ac === undefined) char.ac = []

  char._fAc = char.ac.map((it) => it.ac || it)

  // HP
  if (char.hp === undefined) char.hp = { average: 'Unknown' }

  if (char.hp.average) {
    char._fHp = char.hp.average
    char._fMaximumHp = int(char._fHp, undefined) // set maximum HP as the average per now
    // TODO: implement something to change between average, minimum and maximum hp at tracker
  } else if (char.hp.rolls) {
    // hp doesnt have average, so is a character with proper value
    char._fMaximumHp = sum(char.hp.rolls, sum(char.hp.bonus))
    char._fHp = char._fMaximumHp
  }

  // ALIGNMENT
  if (char.alignment) {
    const tempAlign =
      typeof char.alignment[0] === 'object'
        ? Array.prototype.concat.apply(
            [],
            char.alignment.map((a) => a.alignment)
          )
        : [...char.alignment]
    if (tempAlign.includes('N') && !tempAlign.includes('G') && !tempAlign.includes('E')) tempAlign.push('NY')
    else if (tempAlign.includes('N') && !tempAlign.includes('L') && !tempAlign.includes('C')) tempAlign.push('NX')
    else if (tempAlign.length === 1 && tempAlign.includes('N')) Array.prototype.push.apply(tempAlign, ['NX', 'NY'])
    char._fAlign = tempAlign
  } else {
    char._fAlign = null
  }

  // OTHERS
  char._fVuln = char.vulnerable ? allImmunitiesAndResistances(char.vulnerable, 'vulnerable') : []
  char._fRes = char.resist ? allImmunitiesAndResistances(char.resist, 'resist') : []
  char._fImm = char.immune ? allImmunitiesAndResistances(char.immune, 'immune') : []
  char._fCondImm = char.conditionImmune ? allImmunitiesAndResistances(char.conditionImmune, 'conditionImmune') : []
  char._fSave = char.save ? Object.keys(char.save) : []
  char._fSkill = char.skill ? Object.keys(char.skill) : []
  char._fSources = char.otherSources ? [char.source].concat(char.otherSources.map((src) => src.source)) : char.source

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
      total: int(char._fMaximumHp, undefined) // usualy SUM(hp.maximum), but its here for any bonusus/onusus
    }
    if (!_.isObjectLike(char._hp)) {
      hp[default_hp_key] = int(char._hp, hp.total)
    }

    char._hp = hp
  }

  if (char._hp.total === undefined) char._hp.total = char._fMaximumHp
  if (char._hp.temporary === undefined) char._hp.temporary = 0
  if (char._hp.current === undefined) char._hp.current = char._hp.total
  if (char._hp.death_saving_throw === undefined) char._hp.death_saving_throw = [false, false, false, false, false]

  // CONDITIONS
  if (!isValid(char._conditions) || !_.isObjectLike(char._conditions)) {
    char._conditions = []
  }

  // _ID
  char._id = `${char.name}#${char.source}--${uuid().substr(0, 7)}`

  return char
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
  // RENDERERS
  speedToArray,
  acToArray,
  skillsToArray,
  savesToArray,
  sensesToArray,
  languagesToArray,
  immunitiesAndResistancesToArray,
  conditionImmunitiesToArray,
  conditionsToArray,
  // factory
  make
}
