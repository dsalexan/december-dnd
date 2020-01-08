/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import Vue from 'vue'
import _ from 'lodash'

import { sort, sortCR, indexSort, sortLower, sortMisc, sortProp } from '~/utils/sort'
// eslint-disable-next-line no-unused-vars
import { STATES, STATES_PROGRESSION } from '@/domain/filter/item'

import {
  isNonstandardSource,
  getFilterGroup,
  sourceJSONToFullCompactPrefix,
  sourceJSONToFull,
  sourceJSONToColor,
  sourceJSONToAbv
} from '~/domain/source'
import { creatureLevel } from '~/domain/character'

import { SIZES, DAMAGE, SENSES, SKILLS, ABILITIES, ALIGNMENT, CHARACTER, SPELLCASTING, CR } from '~/utils/system/constants'
import { LIST_CR } from '~/utils/system/constants/cr'
import { LIST_CONDITIONS } from '~/utils/system/constants/conditions'

import { toNumber as CRtoNumber } from '~/utils/system/cr'
import { abbreviationToFull } from '~/utils/system/alignment'
import { isValid } from '~/utils/value'
import { info, error, warn } from '~/utils/debug'

const log = info.extend('filter:character')

export const state = () => ({
  _: {
    inited: false,
    built: false
  },
  filters: {},
  list: [],
  search: undefined,
  searchedList: [],
  filterFn: undefined,
  filteredList: []
})

export const getters = {
  filterFn(state) {
    return (item) => {
      for (const filter of Object.values(state.filters)) {
        const _filter = filter.filterFn(item)
        if (!_filter) return false
      }

      return true
    }
  },
  tags(state) {
    const _includes = Object.values(state.filters)
      .map((filter) =>
        Object.values(filter.items)
          .flat()
          .filter((i) => i.state === STATES.INCLUDE_ENTRY)
          .map((i) => ({
            data: i.data,
            text: filter.displayFn(i.data),
            filter: filter.key
          }))
      )
      .flat()

    const _excludes = Object.values(state.filters)
      .map((filter) =>
        Object.values(filter.items)
          .flat()
          .filter((i) => i.state === STATES.EXCLUDE_ENTRY)
          .map((i) => ({
            data: i.data,
            text: filter.displayFn(i.data),
            filter: filter.key
          }))
      )
      .flat()

    return [
      ..._includes.map((t) => ({
        ...t,
        color: 'blue darken-4'
      })),
      ..._excludes.map((t) => ({
        ...t,
        color: 'red darken-4'
      }))
    ]
  }
}

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

    if (!isValid(item)) {
      error('ADD ITEM', key, item)
      return
    }

    const group = filter.groupFn(item)

    if (filter.items[group.key] === undefined) Vue.set(filter.items, group.key, [])

    if (filter.items[group.key].find((it) => _.isEqual(it.data, item))) return // already exists

    filter.items[group.key].splice(filter.items[group.key].length, 0, {
      data: item,
      group: group.key,
      state: STATES.INACTIVE,
      toogleState() {
        this.state = STATES_PROGRESSION[this.state]
      }
    })

    filter.items[group.key].sort(filter.sortFn)
    // Vue.set(filter.items[group.key], filter.items[group.key].length, {
    //   data: item,
    //   group: group.key,
    //   state: STATES.INACTIVE
    // })

    if (!filter.groups.find((g) => g.key === group.key)) {
      filter.groups.splice(filter.groups.length, 0, group)
      // Vue.set(filter.groups, filter.groups.length, group)
    }

    // info('ADD ITEM', state)
  },
  setFilter(state, { key, filter }) {
    Vue.set(state.filters, key, filter)
  }
}

export const actions = {
  removeTag({ state, dispatch }, { data, filter }) {
    for (const group in state.filters[filter].items) {
      for (const item of state.filters[filter].items[group]) {
        if (_.isEqual(item.data, data)) {
          item.state = STATES.INACTIVE
          dispatch('doFilter')
        }
      }
    }
  },
  // INIT
  async build({ state, dispatch, rootState }) {
    if (state._.built) return

    await dispatch('addFilter', {
      key: 'source',
      target: 'source',
      header: 'Source',
      defaultFn: (val) => !isNonstandardSource(val.data || val),
      groupFn: getFilterGroup,
      displayFn: (item) => sourceJSONToFullCompactPrefix(item.data || item)
    })

    await dispatch('addFilter', {
      key: 'cr',
      target: '__pCr',
      header: 'Challenge Rating',
      model: {
        type: 'range',
        isLabelled: true
      },
      sortFn: sortCR,
      items: [...LIST_CR],
      value: [0, LIST_CR.length - 1],
      parserFn: CRtoNumber
    })

    await dispatch('addFilter', {
      key: 'level',
      target: '_fLevel',
      header: 'Level',
      model: {
        type: 'range',
        min: 1,
        max: 30
      },
      sortFn: (a, b) => sort(creatureLevel(a), creatureLevel(b))
    })

    await dispatch('addFilter', {
      key: 'size',
      target: '__fSize',
      header: 'Size',
      items: [...SIZES.LIST_ABBREVIATIONS],
      displayFn: (item) => SIZES.ABBREVIATION_TO_FULL.A(item.data),
      sortFn: (a, b) => indexSort(a.data, b.data, SIZES.LIST_ABBREVIATIONS)
    })

    await dispatch('addFilter', {
      key: 'speed',
      header: 'Speed',
      model: {
        type: 'range',
        min: 0,
        max: 400
      }
    })

    await dispatch('addFilter', {
      key: 'speedType',
      header: 'Speed Type',
      items: ['walk', 'burrow', 'climb', 'fly', 'hover', 'swim'],
      displayFn: (str) => (str.data || str).uppercaseFirst()
    })

    await dispatch('addFilter', {
      key: 'ac',
      header: 'Armor Class',
      model: {
        type: 'range'
      }
    })

    await dispatch('addFilter', {
      key: 'averageHitPoints',
      header: 'Average Hit Points',
      model: {
        type: 'range'
      }
    })

    await dispatch('addFilter', {
      key: 'type',
      header: 'Type',
      items: [...CHARACTER.LIST_TYPES],
      displayFn: (str) => (str.data || str).toTitleCase(),
      itemSortFn: sortLower
    })

    await dispatch('addFilter', {
      key: 'tag',
      header: 'Tags',
      displayFn: (str) => (str.data || str).uppercaseFirst()
    })

    await dispatch('addFilter', {
      key: 'alignment',
      header: 'Alignment',
      items: [...ALIGNMENT.LIST_ABBREVIATIONS],
      displayFn: (item) => abbreviationToFull(item.data || item),
      sortFn: (a, b) => indexSort(a.data, b.data, ALIGNMENT.LIST_ABBREVIATIONS)
    })

    await dispatch('addFilter', {
      key: 'language',
      header: 'Languages',
      displayFn: (item) =>
        (rootState.tools.bestiary.references.languages && rootState.tools.bestiary.references.languages[item.data || item]) ||
        item.data ||
        item,
      umbrellaItems: ['X', 'XX'],
      umbrellaExcludes: ['CS']
    })

    await dispatch('addFilter', {
      key: 'damageType',
      header: 'Damage Inflicted',
      items: [...DAMAGE.LIST_ABBREVIATIONS],
      displayFn: (str) => DAMAGE.ABBREVIATION_TO_FULL.A(str.data || str).toTitleCase()
    })

    await dispatch('addFilter', {
      key: 'senses',
      header: 'Senses',
      items: [...SENSES.LIST_ABBREVIATIONS],
      displayFn: (str) => SENSES.ABBREVIATION_TO_FULL.A(str.data || str).toTitleCase()
    })

    await dispatch('addFilter', {
      key: 'skills',
      header: 'Skills',
      items: [...SKILLS.LIST_SKILLS],
      displayFn: (str) => (str.data || str).toTitleCase()
    })

    await dispatch('addFilter', {
      key: 'saves',
      header: 'Saves',
      items: [...ABILITIES.LIST_ABBREVIATIONS],
      displayFn: (str) => ABILITIES.ABBREVIATIONS_TO_FULL.A(str.data || str),
      sortFn: (a, b) => indexSort(a.data, b.data, ABILITIES.LIST_ABBREVIATIONS)
    })

    await dispatch('addFilter', {
      key: 'environment',
      header: 'Environment',
      items: [
        'arctic',
        'coastal',
        'desert',
        'forest',
        'grassland',
        'hill',
        'mountain',
        'swamp',
        'underdark',
        'underwater',
        'urban'
      ],
      displayFn: (str) => (str.data || str).uppercaseFirst()
    })

    await dispatch('addFilter', {
      key: 'damageVulnerabilities',
      header: 'Damage Vulnerabilities',
      items: [...DAMAGE.LIST_ABBREVIATIONS],
      displayFn: (str) => (str.data || str).uppercaseFirst()
    })

    await dispatch('addFilter', {
      key: 'damageResistance',
      header: 'Damage Resistances',
      items: [...DAMAGE.LIST_ABBREVIATIONS],
      displayFn: (str) => (str.data || str).uppercaseFirst()
    })

    await dispatch('addFilter', {
      key: 'damageImmunity',
      header: 'Damage Immunities',
      items: [...DAMAGE.LIST_ABBREVIATIONS],
      displayFn: (str) => (str.data || str).uppercaseFirst()
    })

    await dispatch('addFilter', {
      key: 'conditionImmunity',
      header: 'Condition Immunity',
      items: [...LIST_CONDITIONS],
      displayFn: (str) => (str.data || str).uppercaseFirst()
    })

    await dispatch('addFilter', {
      key: 'traits',
      header: 'Traits',
      items: [
        'Aggressive',
        'Ambusher',
        'Amorphous',
        'Amphibious',
        'Antimagic Susceptibility',
        'Brute',
        'Charge',
        'Damage Absorption',
        'Death Burst',
        "Devil's Sight",
        'False Appearance',
        'Fey Ancestry',
        'Flyby',
        'Hold Breath',
        'Illumination',
        'Immutable Form',
        'Incorporeal Movement',
        'Keen Senses',
        'Legendary Resistances',
        'Light Sensitivity',
        'Magic Resistance',
        'Magic Weapons',
        'Pack Tactics',
        'Pounce',
        'Rampage',
        'Reckless',
        'Regeneration',
        'Rejuvenation',
        'Shapechanger',
        'Siege Monster',
        'Sneak Attack',
        'Spider Climb',
        'Sunlight Sensitivity',
        'Turn Immunity',
        'Turn Resistance',
        'Undead Fortitude',
        'Water Breathing',
        'Web Sense',
        'Web Walker'
      ]
    })

    await dispatch('addFilter', {
      key: 'actionsReactions',
      header: 'Actions & Reactions',
      items: ['Frightful Presence', 'Multiattack', 'Parry', 'Swallow', 'Teleport', 'Tentacles']
    })

    await dispatch('addFilter', {
      key: 'misc',
      header: 'Miscellaneous',
      items: [
        'Familiar',
        ...CHARACTER.LIST_MISC,
        'Lair Actions',
        'Legendary',
        'Adventure NPC',
        'Spellcaster',
        ...ABILITIES.LIST_ABILITIES.map((it) => `Spellcaster, ${it}`),
        'Regional Effects',
        'Reactions',
        'Swarm',
        'Has Variants',
        'Modified Copy',
        'Has Alternate Token',
        'SRD'
      ],
      displayFn: (str) => CHARACTER.MISC_ABBREVIATION_TO_FULL.A(str.data || str).uppercaseFirst(),
      sortFn: sortMisc
    })

    await dispatch('addFilter', {
      key: 'spellcasting',
      header: 'Spellcasting Type',
      items: [...SPELLCASTING.LIST_ABBREVIATIONS],
      displayFn: (str) => SPELLCASTING.ABBREVIATIONS_TO_FULL.A(str.data || str)
    })

    log('Builded', state.filters)
    state._.built = true
  },
  async load({ state, commit, dispatch }) {
    const { loadedSources, meta, languages } = await dispatch('tools/bestiary/load', undefined, { root: true })

    log('Loaded', loadedSources, meta, languages)

    return { sources: loadedSources, languages }
  },
  async init({ state, dispatch, commit }) {
    const build = dispatch('build')
    const load = dispatch('load')

    const [buildResponse, loadResponse] = await Promise.all([build, load])

    // ADD FIRST LEVEL FILTERS
    Object.keys(loadResponse.sources)
      // .map(src => new FilterItem({item: src, changeFn: loadSource(JSON_LIST_NAME, addMonsters)}))
      .forEach((fi) => state.filters.source.addItem(fi))

    Object.keys(loadResponse.languages).forEach((key) => state.filters.language.addItem(key))

    state._.inited = true

    log('Initialized', state)
  },
  destroy({ state, commit }) {
    state._.inited = false
    state._.built = false

    // kill build
    state.filters.splice(0, state.filters.length)

    // kill load
    commit('setReference', { key: 'languages', data: undefined })
    commit('setReference', { key: 'meta', data: undefined })

    log('Destroyed')
  },
  // FUNCTION
  async addFilter(
    { state, commit, dispatch, rootState },
    {
      key,
      target,
      model = { type: 'tag' },
      header,
      value,
      defaultFn,
      displayFn,
      sortFn,
      groupFn,
      parserFn,
      items = [],
      umbrellaItems = [],
      umbrellaExcludes = []
    } = {}
  ) {
    // #region SETTING
    if (defaultFn === undefined) {
      defaultFn = () => STATES.INACTIVE
    }

    if (displayFn === undefined) {
      displayFn = (i) => (i && i.data && i.data.display) || (i && i.display) || (i && i.data) || i
    }

    if (sortFn === undefined) {
      sortFn = (a, b) => sort(a, b)
    }

    if (groupFn === undefined) {
      groupFn = () => ({ key: 'default', hide: true })
    }

    if (parserFn === undefined) {
      parserFn = (arg) => arg
    }
    // #endregion

    // MODEL SHIT
    if (model.hasMultiple === undefined) model.hasMultiple = model.type === 'tag'
    if (model.hasGenericSelection === undefined) model.hasGenericSelection = model.type === 'tag'
    if (model.max === undefined) Vue.set(model, 'max', undefined)
    if (model.min === undefined) Vue.set(model, 'min', undefined)
    if (model.type === 'range' && items.length === 0 && model.max !== undefined) {
      items = [...Array(model.max - model.min).keys()].map((k) => k + model.min)
    }

    // WORK DATA
    const _items = items.sort(sortFn)

    const filter = {
      key,
      target,
      model,
      header,
      defaultFn,
      displayFn,
      sortFn,
      groupFn,
      parserFn,
      multiple: false,
      items: {},
      groups: [],
      value: value !== undefined ? value : model.min === undefined || model.max === undefined ? [] : [model.min, model.max],
      addItem: (_item) => {
        function _helper(item) {
          if (item === null || item === undefined) return
          if (Array.isArray(item)) item.forEach((it) => _helper(it))
          else {
            commit('addItem', { key, item })
          }
          // else if (!this._items.find((it) => Filter._isItemsEqual(it, item))) {
          //   item = item instanceof FilterItem ? item : new FilterItem({ item })
          //   Filter._validateItemNests([item], this._nests)

          //   this._isItemsDirty = true
          //   this._items.push(item)
          //   if (this._state[item.item] == null) this._defaultItemState(item)
          // }
        }

        _helper(_item)
      },
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
        if (this.model.type === 'range') {
          this.value = [0, Object.values(this.items)[0].length]
        } else {
          for (const group in this.items) {
            for (const item of this.items[group]) {
              const _default = this.defaultFn(item)
              if (_default) item.state = _default === true ? STATES.INCLUDE_ENTRY : _default
              else item.state = STATES.INACTIVE
            }
          }
        }
      },
      filterFn(item) {
        if (!isValid(this.target)) return true

        const value = rootState.tools.bestiary.list[item.index][this.target]

        if (this.model.type === 'range') {
          if (this.value[0] === 0 && this.value[1] >= this.items.default.length) return true // interval covers all

          const min = this.items.default[this.value[0]]
          const max = this.items.default[this.value[1]]

          const interval = [this.parserFn(min.data || min), this.parserFn(max.data || max)]

          const parsedValue = this.parserFn(value)

          return interval[0] <= parsedValue && parsedValue <= interval[1]
        } else {
          const _includes = Object.values(this.items)
            .flat()
            .filter((i) => i.state === STATES.INCLUDE_ENTRY)
            .map((i) => i.data)

          const _excludes = Object.values(this.items)
            .flat()
            .filter((i) => i.state === STATES.EXCLUDE_ENTRY)
            .map((i) => i.data)

          const include = _includes.find((i) => i === value) !== undefined
          const exclude = _excludes.find((i) => i === value) !== undefined

          if (_includes.length > 0 || _excludes.length > 0) {
            if (include && !exclude) {
              return true
            }
          } else {
            return true
          }

          return false
        }
        // TODO: Algo include in this function UMBRELLA properties
      }
    }

    await commit('setFilter', { key, filter })

    await Promise.all(_items.map((i) => commit('addItem', { key, item: i })))
  },
  selectDefault({ state }) {
    Object.values(state.filters).forEach((filter) => filter.selectDefault())
  },
  // eslint-disable-next-line require-await
  async addToFilters({ state, rootState }, { char, isExcluded }) {
    function reference(map, key) {
      return rootState.tools.bestiary.references[map] && rootState.tools.bestiary.references[map][key.data || key]
    }

    // region populate filters
    if (!isExcluded) {
      state.filters.source.addItem(char.__fSources)
      if (isValid(char.__pCr)) state.filters.cr.addItem(char.__pCr)
      if (isValid(char._fLevel)) state.filters.level.addItem(char._fLevel)
      // this._strengthFilter.addItem(char.str)
      // this._dexterityFilter.addItem(char.dex)
      // this._constitutionFilter.addItem(char.con)
      // this._intelligenceFilter.addItem(char.int)
      // this._wisdomFilter.addItem(char.wis)
      // this._charismaFilter.addItem(char.cha)
      state.filters.speed.addItem(char._fSpeed)
      char.ac.forEach((it) => state.filters.ac.addItem(it.ac || it))
      if (char.hp.average) state.filters.averageHitPoints.addItem(char.hp.average)
      char.__pTypes.tags.forEach((t) => state.filters.tag.addItem(t))

      // MISC
      char._fMisc = char.legendary || char.legendaryGroup ? ['Legendary'] : []
      if (char.familiar) char._fMisc.push('Familiar')
      if (char.type.swarmSize) char._fMisc.push('Swarm')
      if (char.spellcasting) {
        char._fMisc.push('Spellcaster')
        char.spellcasting.forEach((sc) => {
          if (sc.ability) char._fMisc.push(`Spellcaster, ${ABILITIES.ABBREVIATIONS_TO_FULL.A(sc.ability)}`)
        })
      }
      if (char.isNpc) char._fMisc.push('Adventure NPC')
      if (char.legendaryGroup && (reference('meta', char.legendaryGroup.source) || {})[char.legendaryGroup.name]) {
        if ((reference('meta', char.legendaryGroup.source) || {})[char.legendaryGroup.name].lairActions)
          char._fMisc.push('Lair Actions')
        if ((reference('meta', char.legendaryGroup.source) || {})[char.legendaryGroup.name].regionalEffects)
          char._fMisc.push('Regional Effects')
      }
      if (char.reaction) char._fMisc.push('Reactions')
      if (char.variant) char._fMisc.push('Has Variants')
      if (char.miscTags) char._fMisc.push(...char.miscTags)
      if (char._isCopy) char._fMisc.push('Modified Copy')
      if (char.altArt) char._fMisc.push('Has Alternate Token')
      if (char.srd) char._fMisc.push('SRD')

      state.filters.traits.addItem(char.traitTags)
      state.filters.actionsReactions.addItem(char.actionTags)
      state.filters.environment.addItem(char.environment)
    }
  },
  // eslint-disable-next-line require-await
  addToList({ state, dispatch }, { mon, isExcluded }) {
    dispatch('addToFilters', { char: mon, isExcluded })

    const item = {
      index: mon._index,
      name: mon.name,
      data: {
        hash: mon._hash,
        source: mon.source,
        type: mon.__pTypes.asText.uppercaseFirst(),
        crLevel: mon.__fCrLevel,
        alias: (mon.alias || []).map((it) => `"${it}"`).join(','),
        uniqueId: mon.uniqueId ? mon.uniqueId : state._index
      }
    }

    const keys = ['hash', 'source.source', 'source.full', 'type', 'crLevel.display', 'alias', 'uniqueId']

    item.searchText = `${mon.name} - ${keys.map((k) => _.get(item, k)).join(' - ')}`.toLowerCase()

    state.list.splice(state.list.length, 0, item)
  },
  // METHODS
  doSearch({ state, dispatch }, searchTerm) {
    if (isValid(searchTerm))
      state.search = searchTerm
        .trim()
        .toLowerCase()
        .split(/\s+/g)
        .join(' ')

    if (!isValid(state.search)) {
      state.searchedList.splice(0, state.searchedList.length, ...state.list)
      // return state.list.length
    } else {
      const result = state.list.filter((it) => it.searchText.includes(state.search))
      state.searchedList.splice(0, state.searchedList.length, ...result)
    }

    log('Search', state.searchTerm, state.searchedList.length, 'of', state.list.length)

    dispatch('doFilter')
  },
  doFilter({ state, getters, dispatch }) {
    const _fn = getters.filterFn

    state.filteredList.splice(0, state.filteredList.length, ...state.searchedList.filter((i) => _fn(i)))

    state.filteredList.sort((a, b) => sortProp('name', a, b))

    log('Filter', state.filterFn, state.filteredList.length, 'of', state.searchedList.length)
  }
}
