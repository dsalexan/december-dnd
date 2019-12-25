import { CR } from './constants'
import { LIST_CR } from './constants/cr'
import { ADD_COMMAS } from '@/utils/regex'

import { toFractional as numberToFractional } from '@/utils/number'

export function toXp(cr, number = false) {
  if (cr != null && cr.xp) return ADD_COMMAS(cr.xp)

  const toConvert = cr ? cr.cr || cr : null

  if (number) {
    if (toConvert === 'Unknown' || toConvert == null) return null
    return CR.TO_XP.A(toConvert)
  } else {
    if (toConvert === 'Unknown' || toConvert == null) return 'Unknown'
    if (toConvert === '0') return '0 or 10'
    return ADD_COMMAS(CR.TO_XP.A(toConvert))
  }
}

export function isValid(cr) {
  return LIST_CR.includes(cr)
}

export function toNumber(cr) {
  if (cr === 'Unknown' || cr === '\u2014' || cr == null) return 100
  if (cr.cr) return toNumber(cr.cr)
  const parts = cr.trim().split('/')
  if (parts.length === 1) return Number(parts[0])
  else if (parts.length === 2) return Number(parts[0]) / Number(parts[1])
  else return 0
}

export function fromNumber(number, safe) {
  // avoid dying if already-converted number is passed in
  if (safe && typeof number === 'string' && LIST_CR.includes(number)) return number

  if (number == null) return 'Unknown'

  return numberToFractional(number)
}

export function toProficiencyBonus(cr) {
  if (cr === 'Unknown' || cr == null) return 0
  cr = cr.cr || cr
  if (toNumber(cr) < 5) return 2
  return Math.ceil(cr / 4) + 1
}

export default {
  toXp,
  isValid,
  toNumber,
  fromNumber,
  toProficiencyBonus
}
