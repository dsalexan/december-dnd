import _ from 'lodash'

import makeItem from './item'
import { sort } from '@/utils/sort'

function makeFilterBase({ header, defaultFn, displayFn, sortFn, groupFn } = {}) {
  if (!_.isString(header)) {
    throw new TypeError('Filter header is not a string')
  }

  if (defaultFn === undefined) {
    defaultFn = () => true
  }

  if (displayFn === undefined) {
    displayFn = (i) => (i && i.data && i.display) || (i && i.display) || (i && i.data) || i
  }

  return {
    header,
    defaultFn,
    displayFn,
    multiple: false,
    sortFn: sortFn || ((a, b) => sort(a, b)),
    makeGroups: (array) => {
      if (groupFn === undefined) return { default: array }
      else {
        const groups = {}

        for (const entry of array) {
          const group = groupFn(entry)

          if (groups[group] === undefined) groups[group] = []
          groups[group].push(entry)
          entry.group = group
        }

        return groups
      }
    }
  }
}

// _.mergeWith(a, b, (obj, src) => {if (_.isArray(obj)) return obj.concat(src)})

export function makeFilter({ header, defaultFn, displayFn, sortFn, groupFn, items = [] } = {}) {
  const base = makeFilterBase({ header, defaultFn, displayFn, sortFn, groupFn })

  items = items.map((i) => makeItem(i))

  if (base.sortFn !== undefined) {
    items = items.sort(base.sortFn)
  }

  items = base.makeGroups(items)

  return {
    ...base,
    model: 'tag',
    items,
    addItem: (item) => {
      const _groupFn = groupFn || (() => 'default')
      const group = _groupFn(item)

      if (items[group] === undefined) items[group] = []
      items[group].push(makeItem(item, { group }))
    }
  }
}

export function makeRangeFilter({ header, defaultFn, displayFn, sortFn, groupFn, min, max, values = [] } = {}) {
  const base = makeFilterBase({ header, defaultFn, displayFn, sortFn, groupFn })

  if (base.sortFn !== undefined) {
    values = values.sort(base.sortFn)
  }

  values = base.makeGroups(values)

  return {
    ...base,
    model: 'range',
    min,
    max,
    values,
    addValue: (item) => {
      const _groupFn = groupFn || (() => 'default')
      const group = _groupFn(item)

      if (values[group] === undefined) values[group] = []
      values[group].push(item)
    }
  }
}

export default {
  makeFilter,
  makeRangeFilter
}
