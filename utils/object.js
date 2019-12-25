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
    if (abMap[v] === b) return v
  }
  return b
}

export default {
  A_to_B,
  B_to_A
}
