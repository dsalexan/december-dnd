import _ from 'lodash'

import crypt from './crypt'

export function isValid(value) {
  return value !== undefined && value !== null
}

export default {
  isValid,
  int,
  asArray,
  sum,
  bool,
  hash,
  color
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

export function hash(value) {
  return crypt.md5(JSON.stringify(value))
}

export function color(value) {
  // Prevent any injection shenanigans
  return value.replace(/[^a-fA-F0-9]/g, '').slice(0, 8)
}
