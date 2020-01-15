import { UNITS } from './constants'

export function parseUnit(string) {
  const REGEX = /(ft|in|inches|foot|feet)\.?/gim
  const tokens = string.split(REGEX)

  return tokens
    .map((t, index) => {
      if ((index + 1) % 2 === 0) {
        const name = UNITS.UNIT_TO_NAMES.B(t)
        const unit = UNITS.UNIT_TO_ABBREVIATION.A(name, false)

        if (unit !== false) return `${unit}.`
      }
      return t
    })
    .join('')
}

export default {
  _: UNITS,
  parseUnit
}
