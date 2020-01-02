export function getOrdinalForm(i) {
  i = Number(i)
  if (isNaN(i)) return ''
  const j = i % 10
  const k = i % 100
  if (j === 1 && k !== 11) return `${i}st`
  if (j === 2 && k !== 12) return `${i}nd`
  if (j === 3 && k !== 13) return `${i}rd`
  return `${i}th`
}

export function spLevelToFull(level) {
  if (level === 0) return 'Cantrip'
  else return getOrdinalForm(level)
}

export function spLevelToFullLevelText(level, dash) {
  return `${spLevelToFull(level)}${level === 0 ? 's' : `${dash ? '-' : ' '}level`}`
}

export function levelToPb(level) {
  if (!level) return 2
  return Math.ceil(level / 4) + 1
}

export default {
  getOrdinalForm,
  spLevelToFull,
  spLevelToFullLevelText,
  levelToPb
}
