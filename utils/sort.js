import _ from 'lodash'

import { toNumber as crToNumber } from '../domain/system/cr'
import { LIST_ABILITIES } from '../domain/system/constants/abilities'
import { ABILITIES } from '../domain/system/constants'
import { NUMBER_CLEAN_REGEXP } from './regex'
// eslint-disable-next-line no-unused-vars
import { info } from './debug'
import { creatureLevel } from '~/domain/character'

// HELPERS
/**
 * Concretly returns the order between two variables
 * @param  {any} a
 * @param  {any} b
 * @param  {Object} options Options object (order, lowercase)
 * @returns {Integer} Order
 */
function _sort(_a, _b, { order = 'ASC', lowercase = false, uppercase = false } = {}) {
  let a = _a
  let b = _b

  if (lowercase) {
    a = typeof a === 'string' ? a.toLowerCase() : a
    b = typeof b === 'string' ? b.toLowerCase() : b
  }
  if (uppercase) {
    a = typeof a === 'string' ? a.toUpperCase() : a
    b = typeof b === 'string' ? b.toUpperCase() : b
  }

  if (b === a) return 0
  const c = b < a ? 1 : -1
  return order === 'ASC' ? c : -1 * c
}

// EXPOSED - GENERAL
/**
 * Returns the order between two variables
 * @param  {any} a Could be a FilterItem
 * @param  {any} b Could be a FilterItem
 * @param  {Object} order Options object (order, lowercase)
 * @returns {Integer} Order
 */
export function sort(a, b, { order = 'ASC', lowercase = false, uppercase = false } = {}) {
  if (a !== undefined && a !== null) a = a.data || a
  if (b !== undefined && b !== null) b = b.data || b

  return _sort(a, b, order)
}

/**
 * Returns the order between two variables as LOWERCASE
 * @param {String} prop Property name
 * @param {any} a Could be comparable
 * @param {any} b Could be comparable
 * @returns {Integer} Order
 */
export function sortLower(a, b) {
  return sort(a, b, { lowercase: true })
}

/**
 * Returns the order between properties of two variables
 * @param {String} prop Property name
 * @param {any} a Could be comparable
 * @param {any} b Could be comparable
 * @param {Object} order Options object (order, lowercase)
 * @returns {Integer} Order
 */
export function sortProp(prop, a, b, { order = 'ASC', lowercase = false, uppercase = false } = {}) {
  return sort(a[prop], b[prop], { order, lowercase, uppercase })
}

/**
 * Returns the order between values of two variables
 * @param {String} key Property name
 * @param {any} a Could be comparable
 * @param {any} b Could be comparable
 * @param {Object} order Options object (order, lowercase)
 * @returns {Integer} Order
 */
export function sortValue(key, a, b, { order = 'ASC', lowercase = false, uppercase = false } = {}) {
  return sort(_.get(a.data, key), _.get(b.data, key), { order, lowercase, uppercase })
}

/**
 * Returns the order between two variables, wit tiebreaker being the numerical suffix
 *
 * WARNING: Slow
 * @param {any} a Could be a FilterItem
 * @param {any} b Could be a FilterItem
 * @param {Object} order Options object (order, lowercase)
 * @returns {Integer} Order
 */
export function sortNumericalSuffix(a, b, { order = 'ASC', lowercase = false, uppercase = false } = {}) {
  function popEndNumber(str) {
    const spl = str.split(' ')
    return spl.last().isNumeric()
      ? [spl.slice(0, -1).join(' '), Number(spl.last().replace(NUMBER_CLEAN_REGEXP, ''))]
      : [spl.join(' '), 0]
  }

  const [aStr, aNum] = popEndNumber(a.data || a)
  const [bStr, bNum] = popEndNumber(b.data || b)

  const initialSort = sort(aStr, bStr)
  if (initialSort) return initialSort
  return sort(aNum, bNum, { order, lowercase, uppercase })
}

/**
 * Returns the order between two dates
 * @param {Date} a Datetime
 * @param {Date} b Datetime
 */
export function sortDate(a, b) {
  return b.getTime() - a.getTime()
}

// EXPOSED - OBJECT ORIENTED
/**
 * Returns the order between the names of the objects (in lowercase)
 * @param {Object} a Object with name
 * @param {Object} b Object with name
 * @returns {Integer} Order
 */
export function compareListNames(a, b) {
  return sortProp('name', a, b, { lowercase: true })
  // return SortUtil._ascSort(a.name.toLowerCase(), b.name.toLowerCase())
}

/**
 * Returns the order between values of the objects (in lowercase), tiebreaker is the name
 * @param {Object} a Object has a name and values
 * @param {Object} b Object has a name and values
 * @param {Object} order Options object (order, lowercase, sortBy)
 * @returns {Integer} Order
 */
export function listSort(a, b, { sortBy, order = 'ASC', lowercase = false, uppercase = false } = {}) {
  if (sortBy === 'name') return sortProp('name', a, b, { lowercase: true })
  // compareListNames
  else return sortValue(sortBy, a, b, { lowercase: true, order }) || sortProp('name', a, b, { lowercase: true, order })
}

/**
 * Returns the order between two values based on its positions in a list
 * @param {Object} a
 * @param {Object} b
 * @param Object} list
 */
export function indexSort(a, b, list) {
  return list.indexOf(a) - list.indexOf(b)
}

// EXPOSED - SYSTEM ORIENTED
/**
 * Returns the order between the cr of two objects
 * @param {Object} a Object has a cr property
 * @param {Object} b Object has a cr property
 * @returns {Integer} Order
 */
export function sortCR(_a, _b) {
  let a, b
  if (a !== undefined && a !== null) a = _a.data || _a
  if (b !== undefined && b !== null) b = _b.data || _b

  // always put unknown values last
  if (a === 'Unknown' || a === undefined) a = '999'
  if (b === 'Unknown' || b === undefined) b = '999'
  return sort(crToNumber(a), crToNumber(b))
}

export function sortLevel(_a, _b) {
  let a, b
  if (a !== undefined && a !== null) a = _a.data || _a
  if (b !== undefined && b !== null) b = _b.data || _b

  const levelA = _.isObjectLike(a) ? creatureLevel(a) : parseInt(a)
  const levelB = _.isObjectLike(b) ? creatureLevel(b) : parseInt(b)

  return sort(levelA, levelB)
}

export function sortCRLevelForItem(_a, _b) {
  const a = _a.data || _a
  const b = _b.data || _b

  // info('sortCRLevelForItem', a, b)

  if (a.level !== undefined) {
    if (b.level !== undefined) {
      return sort(a.value, b.value)
    } else {
      return -1
    }
  } else if (b.level !== undefined) {
    return 1
  } else {
    return sort(a.value, b.value)
  }
}

/**
 * Returns the order between abilities of two objects
 * @param {String} a Ability or "special"
 * @param {String} b Ability or "special"
 * @returns {Integer} Order
 */
export function sortAbilities(a, b) {
  const aSpecial = a === 'special'
  const bSpecial = b === 'special'
  return aSpecial && bSpecial ? 0 : aSpecial ? 1 : bSpecial ? -1 : LIST_ABILITIES.indexOf(a) - LIST_ABILITIES.indexOf(b)
}

/**
 * Returns the order between creature traits
 *
 * "Special Equipment" first, then alphabetical
 * @param {String} a Trait
 * @param {String} b Trait
 * @returns {Integer} Order
 */
export function sortTraits(a, b) {
  const _TRAIT_ORDER = ['special equipment', 'shapechanger']

  if (!a && !b) return 0
  const aClean = a.toLowerCase().trim()
  const bClean = b.toLowerCase().trim()

  const ixA = _TRAIT_ORDER.indexOf(aClean)
  const ixB = _TRAIT_ORDER.indexOf(bClean)
  if (~ixA && ~ixB) return ixA - ixB
  else if (~ixA) return -1
  else if (~ixB) return 1
  else return sort(aClean, bClean)
}

// TODO: transfer specific sorting to domain or util constants?
/**
 * Returns the order between two alignments
 * @param {String[]} a Alignment Array, [LCN, GEN]
 * @param {String[]} b Alignment Array, [LCN, GEN]
 */
export function sortAlignment(a, b) {
  const _alignFirst = ['L', 'C']
  const _alignSecond = ['G', 'E']

  if (a === b) return 0
  if (_alignFirst.includes(a)) return -1
  if (_alignSecond.includes(a)) return 1
  if (_alignFirst.includes(b)) return 1
  if (_alignSecond.includes(b)) return -1
  return 0
}

export function sortMisc(_a, _b) {
  let a = _a.data || _a
  let b = _b.data || _b

  if (a.includes('Spellcaster, ') && b.includes('Spellcaster, ')) {
    a = ABILITIES.ABBREVIATIONS_TO_FULL.B(a.replace('Spellcaster, ', ''))
    b = ABILITIES.ABBREVIATIONS_TO_FULL.B(b.replace('Spellcaster, ', ''))
    return sortAbilities(a, b)
  } else return sort(a, b)
}

/**
 * WHAT THE FUCK DIS DOES?
 * @param {*} $wrpBtnsSort
 * @param {*} list
 */
export function initBtnSortHandlers($wrpBtnsSort, list) {
  function addCaret($btnSort, direction) {
    $wrpBtnsSort.find('.caret').removeClass('caret')
    $btnSort
      .find('.caret_wrp')
      .addClass('caret')
      .toggleClass('caret--reverse', direction === 'asc')
  }

  const $btnSort = $wrpBtnsSort.find(`.sort[data-sort="${list.sortBy}"]`)
  addCaret($btnSort, list.sortDir)

  $wrpBtnsSort.find('.sort').each((i, e) => {
    // eslint-disable-next-line no-undef
    const $btnSort = $(e)
    $btnSort.click((evt) => {
      evt.stopPropagation()
      const direction = list.sortDir === 'asc' ? 'desc' : 'asc'
      addCaret($btnSort, direction)
      list.sort($btnSort.data('sort'), direction)
    })
  })
}
