// eslint-disable-next-line no-unused-vars
import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import { getData, setData } from 'nuxt-storage/local-storage'

import _ from 'lodash'
import debug from '~/utils/debug'

const error = debug.error.extend('tools:brew')

const HOMEBREW_STORAGE = 'HOMEBREW_STORAGE'
const HOMEBREW_META_STORAGE = 'HOMEBREW_META_STORAGE'

export const state = () => ({
  homebrew: null,
  homebrewMeta: null,
  _lists: null,
  _sourceCache: null,
  _filterBox: null,
  _sourceFilter: null,
  _pHandleBrew: null
})

export const actions = {
  load({ state, dispatch }) {
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
  }
}
