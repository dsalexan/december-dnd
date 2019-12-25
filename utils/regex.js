export const DECIMAL_SEPARATOR = (0.1).toLocaleString().substring(1, 2)
export const NUMBER_CLEAN_REGEXP = DECIMAL_SEPARATOR === '.' ? new RegExp(/[\s,]*/g, 'g') : new RegExp(/[\s.]*/g, 'g')
export const COST_SPLIT_REGEXP =
  DECIMAL_SEPARATOR === '.' ? new RegExp(/(\d+(\.\d+)?)([csegp]p)/) : new RegExp(/(\d+(,\d+)?)([csegp]p)/)

export function ADD_COMMAS(text) {
  return `${text}`.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
}

export default {
  // SORTING
  DECIMAL_SEPARATOR,
  NUMBER_CLEAN_REGEXP,
  COST_SPLIT_REGEXP,
  // ??
  ADD_COMMAS
}
