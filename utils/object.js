import Vue from 'vue'
import _ from 'lodash'

import { int } from './value'

export const A_to_B = function(abMap, a, fallback) {
  if (a === undefined || a === null) throw new TypeError('undefined or null object passed to parser')
  if (typeof a === 'string') a = a.trim()
  if (abMap[a] !== undefined) return abMap[a]
  return fallback || a
}

export const B_to_A = function(abMap, b) {
  if (b === undefined || b === null) throw new TypeError('undefined or null object passed to parser')
  if (typeof b === 'string') b = b.trim()
  for (const v in abMap) {
    if (!abMap.hasOwnProperty(v)) continue
    if (abMap[v] === b || (_.isArray(abMap[v]) && abMap[v].includes(b))) return v
  }
  return b
}

export function vueSet(obj, path, value) {
  console.log('VUE SET', obj, path, value)

  function lookaheadValue(next_path) {
    let v = []
    if (next_path === undefined || !_.isInteger(int(next_path, 'string'))) {
      v = {}
    }
    // console.log(`LOOK AHEAD VALUE`, v)
    return v
  }

  let ref = obj

  if (ref === undefined) {
    // eslint-disable-next-line no-console
    console.trace('REFERENCE CANNOT BE UNDEFINED')
    // eslint-disable-next-line no-debugger
    debugger
  }

  if (!(path[0] in ref)) {
    Vue.set(ref, path[0], lookaheadValue(path[1]))
  }

  for (let i = 1; i < path.length; i++) {
    if (!_.isObjectLike(ref[path[i - 1]])) {
      Vue.set(ref, path[i - 1], lookaheadValue(path[i]))
    }

    if (!(path[i] in ref[path[i - 1]])) {
      Vue.set(ref[path[i - 1]], path[i], undefined)
    }

    ref = ref[path[i - 1]]
  }

  if (_.isArray(ref) && int(path.slice(-1)[0], undefined) !== undefined && value === undefined) {
    // if is removing from a array, use splice
    ref.splice(path.slice(-1)[0], 1)
  } else {
    Vue.set(ref, path.slice(-1)[0], value)
  }
}

export default {
  A_to_B,
  B_to_A
}
