import _ from 'lodash'

export function isValid(value) {
  return value !== undefined && value !== null
}

export default {
  isValid
}

export function int(value, fallback) {
  return isNaN(parseInt(value)) ? fallback : parseInt(value)
}

export function asArray(value, fallback = []) {
  if (!isValid(value) && fallback !== undefined) return fallback
  return _.isArray(value) ? value : [value]
}

export function sum(array, initialValue = 0) {
  return asArray(array).reduce((sum, cur) => sum + cur, initialValue)
}

export function bool(value, fallback) {
  if (value === true || value === 'true') return true
  else if (value === false || value === 'false') return false

  return fallback
}
