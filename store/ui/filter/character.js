// eslint-disable-next-line no-unused-vars
import Vue from 'vue'
import { sort } from '~/utils/sort'
// eslint-disable-next-line no-unused-vars
import { STATES, STATES_PROGRESSION } from '@/domain/filter/item'
import { isNonstandardSource, getFilterGroup, sourceJSONToFullCompactPrefix } from '~/domain/source'

export const state = () => ({
  filters: {}
})

export const mutations = {
  clear(state, { key }) {
    const filter = state.filters[key]

    for (const group in filter.items) {
      filter.items[group].splice(0, filter.items[group].length)
    }

    filter.groups.splice(0, filter.groups.length)
  },
  addItem(state, { key, item }) {
    const filter = state.filters[key]

    const group = filter.groupFn(item)

    if (filter.items[group.key] === undefined) Vue.set(filter.items, group.key, [])
    filter.items[group.key].splice(filter.items[group.key].length, 0, {
      data: item,
      group: group.key,
      state: STATES.INACTIVE,
      toogleState() {
        this.state = STATES_PROGRESSION[this.state]
      }
    })
    // Vue.set(filter.items[group.key], filter.items[group.key].length, {
    //   data: item,
    //   group: group.key,
    //   state: STATES.INACTIVE
    // })

    if (!filter.groups.find((g) => g.key === group.key)) {
      filter.groups.splice(filter.groups.length, 0, group)
      // Vue.set(filter.groups, filter.groups.length, group)
    }

    console.log('ADD ITEM', state)
  },
  setFilter(state, { key, filter }) {
    Vue.set(state.filters, key, filter)
  }
}

export const actions = {
  // INIT
  async init({ state, dispatch }) {
    await dispatch('addFilter', {
      key: 'source',
      header: 'Source',
      defaultFn: (val) => !isNonstandardSource(val.data || val),
      groupFn: getFilterGroup,
      displayFn: (item) => sourceJSONToFullCompactPrefix(item.data || item)
    })
  },
  // FUNCTION
  async addFilter(
    { state, commit, dispatch },
    { key, model = 'tag', header, defaultFn, displayFn, sortFn, groupFn, items = [] } = {}
  ) {
    // SETTING
    if (defaultFn === undefined) {
      defaultFn = () => true
    }

    if (displayFn === undefined) {
      displayFn = (i) => (i && i.data && i.display) || (i && i.display) || (i && i.data) || i
    }

    if (sortFn === undefined) {
      sortFn = (a, b) => sort(a, b)
    }

    if (groupFn === undefined) {
      groupFn = () => ({ key: 'default', hide: true })
    }

    // WORK DATA
    const _items = items.sort(sortFn)

    const filter = {
      key,
      model,
      header,
      defaultFn,
      displayFn,
      sortFn,
      groupFn,
      multiple: false,
      items: {},
      groups: [],
      addItem: (item) => commit('addItem', { key, item }),
      clear: () => commit('clear', { key }),
      toogleMultiple() {
        this.multiple = !this.multiple
      },
      unselectAll() {
        for (const group in this.items) {
          for (const item of this.items[group]) {
            if (item.state !== STATES.INACTIVE) {
              item.state = STATES.INACTIVE
            }
          }
        }
      },
      setStateGroup(group, { clear = undefined, value = STATES.INCLUDE_ENTRY, toogle = false } = {}) {
        if (clear === undefined) {
          clear = !this.multiple
        }

        if (clear) {
          this.unselectAll()
        }

        for (const item of this.items[group.key || group]) {
          item.state = toogle ? STATES_PROGRESSION[item.state] : value
        }
      },
      includeAll() {
        for (const group in this.items) {
          this.setStateGroup(group, { clear: false, value: STATES.INCLUDE_ENTRY })
        }
      },
      excludeAll() {
        for (const group in this.items) {
          this.setStateGroup(group, { clear: false, value: STATES.EXCLUDE_ENTRY })
        }
      },
      selectDefault() {
        for (const group in this.items) {
          for (const item of this.items[group]) {
            if (this.defaultFn(item)) item.state = STATES.INCLUDE_ENTRY
            else item.state = STATES.INACTIVE
          }
        }
      }
    }

    await commit('setFilter', { key, filter })

    await Promise.all(_items.map((i) => commit('addItem', { key, item: i })))
  }
}
