import { isNonstandardSource, getFilterGroup, sourceJSONToFullCompactPrefix } from '../source'
import { makeFilter } from './factory'

export default function() {
  const sourceFilter = makeFilter({
    header: 'Source',
    defaultFn: (val) => !isNonstandardSource(val),
    groupFn: getFilterGroup,
    displayFn: (item) => sourceJSONToFullCompactPrefix(item.data || item)
  })

  return {
    filters: {
      source: sourceFilter
    }
  }
}
