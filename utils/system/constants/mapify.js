export default function mapify(data) {
  return Object.freeze({
    A: (key, fallback = undefined, { lowercase = false } = {}) => {
      if (key === undefined || key === null) throw new TypeError('undefined or null object passed to parser')
      if (typeof key === 'string') {
        key = key.trim()
        if (lowercase) key = key.toLowerCase()
      }
      if (data[key] !== undefined) return data[key]
      return fallback || key
    },
    B: (value, { lowercase = false } = {}) => {
      if (value === undefined || value === null) throw new TypeError('undefined or null object passed to parser')
      if (typeof value === 'string') {
        value = value.trim()
        if (lowercase) value = value.toLowerCase()
      }
      for (const key in data) {
        if (!data.hasOwnProperty(key)) continue
        if (data[key] === value) return key
      }
      return value
    }
  })
}
