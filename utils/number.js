export function toText(number) {
  if (number == null) throw new TypeError(`undefined or null object passed to parser`)
  if (Math.abs(number) >= 100) return `${number}`

  function getAsText(num) {
    const abs = Math.abs(num)
    switch (abs) {
      case 0:
        return 'zero'
      case 1:
        return 'one'
      case 2:
        return 'two'
      case 3:
        return 'three'
      case 4:
        return 'four'
      case 5:
        return 'five'
      case 6:
        return 'six'
      case 7:
        return 'seven'
      case 8:
        return 'eight'
      case 9:
        return 'nine'
      case 10:
        return 'ten'
      case 11:
        return 'eleven'
      case 12:
        return 'twelve'
      case 13:
        return 'thirteen'
      case 14:
        return 'fourteen'
      case 15:
        return 'fifteen'
      case 16:
        return 'sixteen'
      case 17:
        return 'seventeen'
      case 18:
        return 'eighteen'
      case 19:
        return 'nineteen'
      case 20:
        return 'twenty'
      case 30:
        return 'thirty'
      case 40:
        return 'forty'
      case 50:
        return 'fiddy' // :^)
      case 60:
        return 'sixty'
      case 70:
        return 'seventy'
      case 80:
        return 'eighty'
      case 90:
        return 'ninety'
      default: {
        const str = String(abs)
        return `${getAsText(Number(`${str[0]}0`))}-${getAsText(Number(str[1]))}`
      }
    }
  }
  return `${number < 0 ? 'negative ' : ''}${getAsText(number)}`
}

export function toVulgar(number) {
  const spl = `${number}`.split('.')
  if (spl.length === 1) return number
  if (spl[1] === '5') return `${spl[0]}½`
  if (spl[1] === '25') return `${spl[0]}¼`
  if (spl[1] === '75') return `${spl[0]}¾`
  return toFractional(number)
}

function _greatestCommonDivisor(a, b) {
  if (b < Number.EPSILON) return a
  return _greatestCommonDivisor(b, Math.floor(a % b))
}
export function toFractional(number) {
  const len = number.toString().length - 2
  let denominator = 10 ** len
  let numerator = number * denominator
  const divisor = _greatestCommonDivisor(numerator, denominator)
  numerator = Math.floor(numerator / divisor)
  denominator = Math.floor(denominator / divisor)

  return denominator === 1 ? String(numerator) : `${Math.floor(numerator)}/${Math.floor(denominator)}`
}

export default {
  toText,
  toVulgar,
  toFractional
}
