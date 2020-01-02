import { render as _render } from './render'
import { int, isValid } from '~/utils/value'
import { parseUnit } from '~/utils/system/units'

export const render = _render

export function stringToValueObject(string, shouldRewrite = false) {
  const REGEX = /^((?:\{@\w+\s)?[\w ]+(?:\})?)\s+(\d+)\s*([a-zA-Z ]+\.?)?\s*(.+)?$/gm
  // 1st -> name
  // 2nd -> value
  // 3rd -> unit (relevant on valueFn function)
  // 4th -> condition (relevant on tooltip)

  const groups = string.split(REGEX)

  if (groups[0] === '') groups.splice(0, 1)
  if (groups.slice(-1)[0] === '') groups.splice(groups.length - 1, 1)

  if (!isValid(groups[2])) groups[2] = ''
  else {
    groups[2] = groups[2].trim()
    groups[2] = ' ' + parseUnit(groups[2])
  }

  if (groups.filter((i) => i !== undefined).length > 2) {
    return [
      {
        name: groups[0],
        value: int(groups[1], groups[1]),
        condition: groups[3]
      },
      {
        displayFn: (v) => `${v}${groups[2]}`,
        shouldRewrite
      }
    ]
  } else {
    return [string, {}]
  }
}

export default {
  render,
  stringToValueObject
}
