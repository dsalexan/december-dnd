import CR from './cr'
import XP from './xp'

import constants from './constants'

export function modifier(value, string = false) {
  const mod = Math.floor((value - 10) / 2)
  if (!string) return mod

  return mod >= 0 ? '+' + mod : mod
}

export default {
  modifier,
  CR,
  XP,
  _: constants
}
