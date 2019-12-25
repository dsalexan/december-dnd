/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import Vue from 'vue'
import { sort, sortCR, indexSort, sortLower, sortMisc } from '~/utils/sort'
// eslint-disable-next-line no-unused-vars
import { STATES, STATES_PROGRESSION } from '@/domain/filter/item'

import { isNonstandardSource, getFilterGroup, sourceJSONToFullCompactPrefix } from '~/domain/source'
import { creatureLevel } from '~/domain/character'

import { SIZES, DAMAGE, SENSES, SKILLS, ABILITIES, ALIGNMENT, CHARACTER, SPELLCASTING } from '~/utils/system/constants'
import { LIST_CR } from '~/utils/system/constants/cr'
import { abbreviationToFull } from '~/utils/system/alignment'
import { LIST_CONDITIONS } from '~/utils/system/constants/conditions'

export const state = () => ({
  filters: {},
  references: {}
})

export const mutations = {
  setReference(state, { key, data }) {
    Vue.set(state.references, key, data)
  },
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

    // console.log('ADD ITEM', state)
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

    await dispatch('addFilter', {
      key: 'cr',
      header: 'Challenge Rating',
      model: {
        type: 'range',
        isLabelled: true
      },
      sortFn: sortCR,
      items: [...LIST_CR],
      value: [0, LIST_CR.length - 1]
    })

    await dispatch('addFilter', {
      key: 'level',
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
      header: 'Armor Class'
    })

    await dispatch('addFilter', {
      key: 'averageHitPoints',
      header: 'Average Hit Points'
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
      displayFn: (item) => (state.references.languages && state.references.languages[item.data || item]) || item.data || item,
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
      key: 'triats',
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

    console.log('INIT FILTER', state.filters)
  },
  // FUNCTION
  async addFilter(
    { state, commit, dispatch },
    {
      key,
      model = { type: 'tag' },
      header,
      value,
      defaultFn,
      displayFn,
      sortFn,
      groupFn,
      items = [],
      umbrellaItems = [],
      umbrellaExcludes = []
    } = {}
  ) {
    // #region SETTING
    if (defaultFn === undefined) {
      defaultFn = () => true
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
    // #endregion

    // MODEL SHIT
    if (model.hasMultiple === undefined) model.hasMultiple = model.type === 'type'
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
      model,
      header,
      defaultFn,
      displayFn,
      sortFn,
      groupFn,
      multiple: false,
      items: {},
      groups: [],
      value:
        value !== undefined ? value : model.min === undefined || model.max === undefined ? undefined : [model.min, model.max],
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
      },
      filterFn() {
        return () => true
        // TODO: Make function that filters the data.
        // TODO: Algo include in this function UMBRELLA properties
      }
    }

    await commit('setFilter', { key, filter })

    await Promise.all(_items.map((i) => commit('addItem', { key, item: i })))
  }
}
