import _ from 'lodash'

import Vue from 'vue'
import makeItem from './item'
import { sort } from '~/utils/sort'

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
      if (groupFn === undefined) {
        return [{ default: array }, [{ key: 'default', hide: true }]]
      } else {
        const index = {}
        const groups = []

        for (const entry of array) {
          const group = groupFn(entry)

          if (index[group.key] === undefined) index[group.key] = []
          index[group.key].push(entry)
          entry.group = group.key

          if (!groups.find((g) => g.key === group.key)) groups.push(group)
        }

        return [index, groups]
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

  const spreadGroups = base.makeGroups(items)
  items = spreadGroups[0]
  const groups = spreadGroups[1]

  return {
    ...base,
    model: 'tag',
    items,
    groups,
    addItem: (item) => {
      const _groupFn = groupFn || (() => ({ key: 'default', hide: true }))
      const group = _groupFn(item)

      if (items[group.key] === undefined) items[group.key] = []
      // items[group.key].splice(items[group.key].length, 0, makeItem(item, { group: group.key }))
      Vue.set(items[group.key], items[group.key].length, makeItem(item, { group: group.key }))

      if (!groups.find((g) => g.key === group.key)) {
        // groups.splice(groups.length, 0, group)
        Vue.set(groups, groups.length, group)
      }
    },
    clear: () => {
      for (const group in items) {
        items[group].splice(0, items[group].length)
      }

      groups.splice(0, groups.length)
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
