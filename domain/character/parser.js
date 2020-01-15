// parser modules are converted from 5etools
import _ from 'lodash'
import { ABBREVIATION_TO_FULL, SINGULAR_TO_PLURAL } from '~/domain/system/constants'
import { toOrdinal } from '~/utils/number'
import '@/utils/string'

/**
 * @typedef {Object} CreatureType
 * @property {String} type
 * @property {String[]} tags
 * @property {String} asText
 */

/**
 * Inject a asText property on creature type object
 * @param  {CreatureType} type Type object from json
 * @returns {CreatureType} Type object from json, INJECTED with asText property
 */
export function CreatureTypeText(type) {
  const out = { type: [], tags: [], asText: '' }

  if (typeof type === 'string') {
    // handles e.g. "fey"
    out.type.push = type
    out.asText = type.uppercaseFirst()
    return out
  } else if (_.isArray(type)) {
    // handles e.g. "fey"
    out.type = type
    out.asText = type.join(', ').uppercaseFirst()
    return out
  }

  const tempTags = []
  if (type.tags) {
    for (const tag of type.tags) {
      if (typeof tag === 'string') {
        // handles e.g. "fiend (devil)"
        out.tags.push(tag)
        tempTags.push(tag.uppercaseFirst())
      } else {
        // handles e.g. "humanoid (Chondathan human)"
        out.tags.push(tag.tag)
        tempTags.push(`${tag.prefix.uppercaseFirst()} ${tag.tag.uppercaseFirst()}`)
      }
    }
  }
  out.type = _.isArray(type.type) ? type.type : [type.type]
  if (type.swarmSize) {
    out.tags.push('swarm')
    out.asText = `swarm of ${ABBREVIATION_TO_FULL.SIZES.A(type.swarmSize).toLowerCase()} ${type.type
      .map(SINGULAR_TO_PLURAL.CREATURE_TYPES.A)
      .join('/')}`
  } else {
    out.asText = `${out.type.map((t) => t.uppercaseFirst()).join('/')}`
  }
  if (tempTags.length) out.asText += ` (${tempTags.join(', ')})`
  return out
}

/**
 * Print creature level as a string
 * @param {Object} level
 * @returns {String} String from levels object
 */
export function CreatureLevelText(level) {
  if (!_.isArray(level)) {
    level = [level]
  }

  return level
    .map((l) => {
      if (_.isObjectLike(l)) return `${toOrdinal(l.level)} level ${l.class.name}${l.subclass ? ` (${l.subclass.name})` : ''}`
      return `${toOrdinal(l)} level`
    })
    .join(', ')
}

export function CreatureCRText(cr) {
  if (cr == null) return ''
  if (typeof cr === 'string') return `${cr}`
  else {
    const stack = [CreatureCRText(cr.cr, cr.xp)]
    if (cr.lair) stack.push(`${CreatureCRText(cr.lair)} when encountered in lair`)
    if (cr.coven) stack.push(`${CreatureCRText(cr.coven)} when part of a coven`)
    return stack.join(' or ')
  }
}

export default { CreatureTypeText, CreatureLevelText, CreatureCRText }
