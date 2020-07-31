// eslint-disable-next-line no-unused-vars
import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import { getData, setData } from 'nuxt-storage/local-storage'

import _ from 'lodash'
import race from '../../../services/race'
import value, { isValid } from '~/utils/value'
import debug from '~/utils/debug'

import * as DATA from '@/utils/data'

const error = debug.error.extend('tools:brew')

const HOMEBREW_STORAGE = 'HOMEBREW_STORAGE'
const HOMEBREW_META_STORAGE = 'HOMEBREW_META_STORAGE'

const bookPairs = [
  ['adventure', 'adventureData'],
  ['book', 'bookData']
]

export const state = () => ({
  homebrew: null,
  homebrewMeta: null,
  _lists: null,
  _sourceCache: null,
  _filterBox: null,
  _sourceFilter: null,
  _pHandleBrew: null,
  // WHAT?
  _DIRS: [
    'action',
    'adventure',
    'background',
    'book',
    'class',
    'condition',
    'creature',
    'deity',
    'disease',
    'feat',
    'hazard',
    'item',
    'magicvariant',
    'object',
    'optionalfeature',
    'psionic',
    'race',
    'reward',
    'spell',
    'subclass',
    'table',
    'trap',
    'variantrule',
    'vehicle'
  ],
  _STORABLE: [
    'class',
    'subclass',
    'spell',
    'monster',
    'legendaryGroup',
    'monsterFluff',
    'background',
    'feat',
    'optionalfeature',
    'race',
    'raceFluff',
    'deity',
    'item',
    'baseitem',
    'variant',
    'itemProperty',
    'itemType',
    'psionic',
    'reward',
    'object',
    'trap',
    'hazard',
    'variantrule',
    'condition',
    'disease',
    'adventure',
    'adventureData',
    'book',
    'bookData',
    'table',
    'tableGroup',
    'vehicle',
    'action'
  ]
})

export const getters = {
  cache(state) {
    return state.homebrewMeta.reduce((obj, cur) => ({ ...obj, [cur.json]: cur }), {})
  },
  // METHODS
  hasHomebrew(state) {
    return state.homebrew && Object.keys(state.homebrew).length > 0
  },

  hasSourceJson(state, getters) {
    return (source) => {
      return !!getters.cache[source]
    }
  },

  sourceJsonToFull(state, getters) {
    return (source) => {
      return getters.cache[source] ? getters.cache[source].full || source : source
    }
  },

  sourceJsonToAbv(state, getters) {
    return (source) => {
      return getters.cache[source] ? getters.cache[source].abbreviation || source : source
    }
  },

  sourceJsonToSource(state, getters) {
    return (source) => {
      return getters.cache[source] ? getters.cache[source] : null
    }
  },

  sourceJsonToStyle(state, getters) {
    return (source) => {
      const color = getters.sourceJsonToColor(source)
      if (color) return `style="color: #${color};"`
      return ''
    }
  },

  sourceJsonToColor(state, getters) {
    return (source) => {
      if (getters.cache[source] && getters.cache[source].color) {
        const validColor = value.color(getters.cache[source].color)
        if (validColor.length) return validColor
        return ''
      } else return ''
    }
  }
}

export const actions = {
  init({ state, dispatch }) {
    if (state.homebrew) {
      return state.homebrew
    } else {
      try {
        const homebrew = getData(HOMEBREW_STORAGE) || {}
        const homebrewMeta = getData(HOMEBREW_META_STORAGE) || { sources: [] }

        Vue.set(state, 'homebrewMeta', {
          ...homebrewMeta,
          sources: homebrewMeta.sources || []
        })

        Vue.set(state, 'homebrew', homebrew)

        dispatch('_resetSourceCache')

        return state.homebrew
      } catch (e) {
        dispatch('purge', e)
      }
    }
  },
  purge({ state, dispatch }, err) {
    error('Error when loading homebrew! Purged homebrew data.', _.cloneDeep(state.homebrew), _.cloneDeep(state.homebrewMeta))

    setData(HOMEBREW_STORAGE, null)
    setData(HOMEBREW_META_STORAGE, null)

    Vue.set(state, 'homebrew', {})
    Vue.set(state, 'homebrewMeta', { sources: [] })

    if (err)
      setTimeout(() => {
        throw err
      })
  },
  _resetSourceCache({ state }) {
    Vue.set(state, '_sourceCache', null)
  },
  async load({ state, dispatch }, { url, page }) {
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch (e) {
      error('The provided URL does not appear to be valid.', url, parsedUrl)
      return
    }

    // BrewUtil.addBrewRemote = async (ele, jsonUrl, doUnescape) => {
    try {
      const data = await DATA.load(`${parsedUrl.href}?${new Date().getTime()}`)
      await dispatch('add', { data, page })
    } catch (err) {
      error('Could not load homebrew from the provided URL.', url, parsedUrl, err)
    }
  },
  async add({ state, dispatch }, { data, page }) {
    // prepare for storage
    if (data.race && data.race.length) data.race = race.mergeSubraces(data.race)
    for (const name of state._STORABLE) {
      if (data[name]) {
        for (let i = 0; i < data[name].length; i++) {
          data[name][i].uniqueId = value.hash(data[name][i])
        }
      } else data[name] = []
    }

    for (const [bookMetaKey, bookDataKey] of bookPairs) {
      if (data[bookMetaKey] && data[bookDataKey]) {
        data[bookMetaKey].forEach((book) => {
          const child = data[bookDataKey].find((it) => it.id === book.id)
          if (child) {
            child.parentUniqueId = book.uniqueId
          }
        })
      }
    }

    // store
    // eslint-disable-next-line require-await
    function pCheckAndAdd(prop) {
      if (!state.homebrew[prop]) Vue.set(state.homebrew, prop, [])
      // in production mode, skip any existing brew
      const areNew = []
      const existingIds = state.homebrew[prop].map((it) => it.uniqueId)
      data[prop].forEach((it) => {
        if (!existingIds.find((id) => it.uniqueId === id)) {
          state.homebrew[prop].splice(state.homebrew[prop].length, 0, it)
          areNew.push(it)
        }
      })
      return areNew
    }

    function checkAndAddMetaGetNewSources() {
      const areNew = []
      if (data._meta) {
        if (!state.homebrewMeta) Vue.set(state, 'homebrewMeta', { sources: [] })

        Object.keys(data._meta).forEach((k) => {
          switch (k) {
            case 'dateAdded':
              break
            case 'sources': {
              const existing = state.homebrewMeta.sources.map((src) => src.json)
              data._meta.sources.forEach((src) => {
                if (!existing.find((it) => it === src.json)) {
                  state.homebrewMeta.sources.splice(state.homebrewMeta.sources.length, 0, src)
                  areNew.push(src)
                }
              })
              break
            }
            default: {
              // if (!isValid(state.homebrew[k])) Vue.set(state.homebrewMeta, k, {})
              Vue.set(state.homebrewMeta, k, data._meta[k])
              break
            }
          }
        })
      }
      return areNew
    }

    // eslint-disable-next-line no-unused-vars
    let sourcesToAdd = data._meta ? data._meta.sources : []
    const toAdd = state._STORABLE.reduce((obj, cur) => ({ ...obj, [cur]: data[cur] }), {})

    if (!isValid(state.homebrew)) state.homebrew = {}

    sourcesToAdd = checkAndAddMetaGetNewSources() // adding source(s) to Filter should happen in per-page addX functions
    // eslint-disable-next-line require-await
    await Promise.all(state._STORABLE.map(async (k) => (toAdd[k] = pCheckAndAdd(k)))) // only add if unique ID not already present

    _.debounce(() => {
      setData(HOMEBREW_STORAGE, state.homebrew)
    }, 500)()
    _.debounce(() => {
      setData(HOMEBREW_META_STORAGE, state.homebrewMeta)
    }, 500)()

    // wipe old cache
    dispatch('_resetSourceCache')
  },
  remove({ state }, { uniqueIds = [] } = {}) {
    if (uniqueIds.length === 0) {
      setData(HOMEBREW_STORAGE, {})
      setData(HOMEBREW_META_STORAGE, {})
      // TODO: Remove from state too to make it better and such
    } else {
      throw new Error('Not implemented')
    }
  }
}
