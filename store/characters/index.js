import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

import { modifier } from '~/domain/system'

import Character, { simplify } from '@/domain/character'
// eslint-disable-next-line no-unused-vars
import CharacterMock from '@/domain/character/mock'
import Rolls from '@/utils/rolls'
// eslint-disable-next-line no-unused-vars
import { info, error } from '~/utils/debug'
import { int, isValid } from '~/utils/value'
import { defaults } from '~/utils/permissions'

// eslint-disable-next-line no-unused-vars
const log = info.extend('characters')

export const state = () => ({
  index: {},
  trackers: {}
})

export const getters = {
  list(state) {
    return Object.values(state.index)
  },
  permissions(state, getters, rootState) {
    function getDefault(scope, string) {
      return (rootState.me.permissions.defaults || {})[scope] || string
    }

    if (rootState.me === undefined) {
      return getters.list.reduce((obj, cur) => ({ ...obj, [cur._id]: defaults(cur._permission || 'character:hidden') }), {})
    }

    const user_permissions = rootState.me.permissions.__CHARACTER__

    const p = getters.list.reduce((obj, char) => {
      return {
        ...obj,
        [char._id]: isValid(user_permissions[char._id])
          ? user_permissions[char._id]
          : defaults(getDefault('__CHARACTER__', char._permission || 'character:hidden'))
      }
    }, {})
    return p
  },
  // values
  character(state, getters) {
    return (_id) => state.index[_id] || {}
  },
  initiative(state, getters) {
    return (_id) => {
      return Character.initiative(state.index[_id])
    }
  },
  creature_type(state) {
    return (_id) => state.index[_id].__pTypes.asText
  },
  level_or_cr(state) {
    return (_id) => {
      const obj = Character.creatureLevelCR(state.index[_id])

      if (obj.level) return obj.display
      else return `CR ${obj.display}`
    }
  },
  background(state) {
    return (_id) => state.index[_id].background
  },
  avatar(state) {
    return (_id) => {
      const _images = (state.index[_id]._fluff && state.index[_id]._fluff.images) || []
      const images = _images.filter((i) => i.type === 'image')

      if (images.length > 1) throw new Error('Too many images to decide a avatar')

      if (images.length === 0) return false

      if (images[0].href) {
        if (images[0].href.type === 'internal') {
          return `img/${images[0].href.path}`
        } else {
          return images[0].href.url
        }
      } else {
        throw new Error('No HREF property in image')
      }
    }
  },
  // manipulations
  sorted(state, getters) {
    return getters.list.sort((a, b) => {
      const initiative = Character.initiative(b) - Character.initiative(a)
      if (initiative === 0) {
        return modifier(b.dex) - modifier(a.dex)
      } else {
        return initiative
      }
    })
  },
  // validations
  hasRolled(state, getters) {
    return (_id, name = 'initiative') => Character.hasRolled(state.index[_id], name)
  }
}

export const mutations = {
  // initiative
  set_initiative(state, { _id, value, add } = {}) {
    if (value !== undefined) {
      if (Rolls.isValid(value)) {
        state.index[_id]._rolls.initiative = value
      }
    }

    if (add !== undefined) {
      const hasRolled = Character.hasRolled(state.index[_id], 'initiative')
      const roll = parseInt(state.index[_id]._rolls.initiative) || 0

      state.index[_id]._rolls.initiative = (hasRolled ? roll : 0) + add
    }
  },
  // hp
  set_hp(state, { _id, value, key = 'current' }) {
    state.index[_id]._hp[key] = int(value, undefined)

    if (state.index[_id]._hp.total === undefined) state.index[_id]._hp.total = int(value, undefined)
  }
}

export const actions = {
  async init({ state, dispatch }) {
    dispatch('subscribe')
    const { data } = await this.$axios.$get(`/characters`)
    // const { dataTrackers } = await this.$axios.$get(`/trackers`)

    state.index = data.reduce((obj, cur) => ({ ...obj, [cur._id]: Character.make(cur) }), {})
    // state.trackers = dataTrackers.reduce((obj, cur) => ({ ...obj, [cur._id]: cur }), {})
  },
  subscribe({ state, commit, dispatch, rootState }) {
    dispatch(
      'pusher/bind',
      {
        event: 'character:added',
        callback: ({ hash, from, data, path }) => {
          dispatch('add', { data: data.character, notify: false })
        }
      },
      { root: true }
    )

    dispatch(
      'pusher/bind',
      {
        event: 'character:updated',
        callback: ({ hash, from, data, path }) => {
          dispatch('update', { data: data.character, notify: false })
        }
      },
      { root: true }
    )

    dispatch(
      'pusher/bind',
      {
        event: 'character:removed',
        callback: ({ hash, from, data, path }) => {
          dispatch('remove', { id: data.character, notify: false })
        }
      },
      { root: true }
    )

    log('Subscribed to notifications channel at pusher (december)')
  },
  // DOMAIN LOGIC?
  add({ state, dispatch, rootGetters }, { data, notify = true }) {
    const character = Character.make(data)
    Vue.set(state.index, character._id, character)

    log(`Adding character <${character._id}> to active tracker (${rootGetters['tracker/active']._id})`, character)

    if (notify) dispatch('notifyCharacterAdd', character._id)
  },
  update({ state, dispatch }, { id, data, action, notify = true }) {
    if (!isValid(id)) id = data._id

    if (!isValid(id)) error(`Character id must be informed in update process`, id, data)

    const character = Character.make(data, id)
    Vue.set(state.index, id, character)

    log(`Updating character <${id}> at tracker`, character)

    if (notify) dispatch('notifyCharacterUpdate', { id: character._id, action })
  },
  updateImage({ state, dispatch }, { id, index, data, notify = true }) {
    if (!isValid(id)) error(`Character id must be informed in update image crop information process`, id, data)

    Vue.set(state.index[id]._fluff.images, index, data)

    log(`Updating character <${id}> image[${index}]`, data)

    if (notify) dispatch('notifyCharacterUpdate', { id, action: 'image' })
  },
  remove({ state, dispatch }, { id, notify = true }) {
    const character = _.cloneDeep(state.index[id])
    Vue.delete(state.index, id)

    log(`Removing character <${id}> at tracker`, character)

    if (notify) dispatch('notifyCharacterRemove', character._id)
  },
  // API SHIT

  // NOTIFY SERVER
  async notifyCharacterAdd({ state, dispatch, rootGetters }, _id) {
    const response = await this.$axios.$post(`/characters`, {
      character: simplify(state.index[_id]),
      tracker: rootGetters['tracker/active']._id
    })

    dispatch('pusher/handleResponse', response, { root: true })

    log(`Notifing server that character <${_id}> has been ADDED to tracker ${rootGetters['tracker/active']._id}`, response)
  },
  async notifyCharacterUpdate({ state, dispatch }, { id, action }) {
    const response = await this.$axios.$put(`/characters/${id}`, {
      character: simplify(state.index[id]),
      action
    })

    dispatch('pusher/handleResponse', response, { root: true })

    log(`Notifing server that character <${id}> has been UPDATED`, response)
  },
  async notifyCharacterRemove({ state, dispatch }, id) {
    const response = await this.$axios.$delete(`/characters/${id}`)

    dispatch('pusher/handleResponse', response, { root: true })

    log(`Notifing server that character <${id}> has been REMOVED`, response)
  }
}
