export const types = ['initiative']

export function isValid(value, die) {
  if (die === undefined) {
    return value !== '?' && value !== undefined && value !== null && !isNaN(parseInt(value))
  } else {
    throw new Error('Not implemented')
  }
}

export default {
  types,
  isValid
}
