import _ from 'lodash'

import { proficiency_modifier } from '~/domain/system'

import { sort as ascSort, compareListNames, sortCR, sort, sortAbilities } from '~/utils/sort'

import { isValid } from '~/utils/value'
import { render, stringToValueObject } from '~/services/renderer'
import { SIZES } from '~/domain/system/constants'
import { creatureLevel, characterSkillBonus, characterSavingThrowBonus, creatureProficiencyBonus } from '~/domain/character'

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

  return 1
}

export function sizeToArray(size) {
  const sizes = [size || []].flat(1)

  return sizes.map((s, index) => ({
    key: index,
    source: s,
    value: s.size || s,
    tooltip: s.condition,
    display: {
      value: SIZES.ABBREVIATION_TO_FULL.A(s.size || s)
    }
  }))
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
  if (typeof ac === 'string' || typeof ac === 'number') return ac // handle classic format

  return ac.map((cur) => {
    return {
      value: _.get(cur, 'ac', cur),
      tooltip: (cur.from || []).map((it) => render(it)),
      source: cur
      // TODO: How to deal with condition here?
    }
  })
}

export function skillsToArray(mon, onlyProficient = false) {
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
    Object.keys(mon.skill || {}).filter(
      (k) => k !== 'other' && k !== 'special' && isValid(mon.skill[k]) && (!onlyProficient || mon.skill[k] !== false)
    )
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
          ratio: 1.1,
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
  // const outerLen = toParse.length
  let maxDepth = 0
  // if (outerLen === 1 && (toParse[0].immune || toParse[0].resist)) {
  //   return toParse.map((it) => toArray(it, -1))
  // }

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

export function spellcastingToArray(spellcasting, character) {
  return [
    {
      label: 'Ability',
      value: spellcasting.ability
    },
    {
      label: 'Attack Bonus',
      value: proficiency_modifier(true, creatureProficiencyBonus(character), character[spellcasting.ability], true)
    },
    {
      label: 'DC',
      value: 8 + proficiency_modifier(true, creatureProficiencyBonus(character), character[spellcasting.ability])
    }
  ]
}

export function featsToArray(feats = []) {
  return feats.map((f) => ({
    value: render(f)
  }))
}

export default {
  // RENDERERS
  sizeToArray,
  speedToArray,
  acToArray,
  skillsToArray,
  savesToArray,
  sensesToArray,
  languagesToArray,
  immunitiesAndResistancesToArray,
  conditionImmunitiesToArray,
  conditionsToArray,
  spellcastingToArray,
  featsToArray
}
