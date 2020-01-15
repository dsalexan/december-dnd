import Vue from 'vue'

// eslint-disable-next-line no-unused-vars
import { isValid } from '~/utils/value'
import { info, error } from '~/utils/debug'
import character from '~/domain/character'
import { modifier } from '~/domain/system'

// eslint-disable-next-line no-unused-vars
const log = info.extend('tracker')

export const state = () => ({
  index: {}
})

export const getters = {
  list(state) {
    return Object.values(state.index)
  },
  active(state, getters) {
    return getters.list.find((t) => t.active) || {}
  },
  round(state, getters) {
    return getters.active.round
  },
  characters(state, getters, rootState) {
    const characters = getters.active.characters || []

    return Object.values(rootState.characters.index)
      .sort((a, b) => {
        const initiative = character.initiative(b) - character.initiative(a)
        if (initiative === 0) {
          return modifier(b.dex) - modifier(a.dex)
        } else {
          return initiative
        }
      })
      .filter((char) => characters.includes(char._id))
  }
}

export const actions = {
  async init({ state, dispatch }) {
    dispatch('subscribe')
    const { data } = await this.$axios.$get(`/tracker`)

    state.index = data.reduce((obj, cur) => ({ ...obj, [cur._id]: cur }), {})
    // state.trackers = dataTrackers.reduce((obj, cur) => ({ ...obj, [cur._id]: cur }), {})
  },
  subscribe({ state, commit, dispatch, rootState }) {
    dispatch(
      'pusher/bind',
      {
        event: 'tracker:updated',
        callback: ({ event, hash, from, data, path, user }) => {
          dispatch('update', { data: data.tracker, notify: false })
        }
      },
      { root: true }
    )

    log('Subscribed to notifications channel at pusher (december)')
  },
  // DOMAIN LOGIC?
  update({ state, dispatch }, { id, data, notify = true }) {
    if (!isValid(id)) id = data._id

    if (!isValid(id)) error(`Tracker id must be informed in update process`, id, data)

    Vue.set(state.index, id, data)

    log(`Updating tracker <${id}>`, data)

    if (notify) dispatch('notifyTrackerUpdate', id)
  },
  setRound({ state, getters, dispatch }, { tracker, value, notify = true }) {
    Vue.set(state.index[tracker], 'round', value)

    log(`Updating round of tracker ${tracker}`, value)

    if (notify) dispatch('notifySetRound', tracker)
  },
  setTracker({ state, getters, dispatch }, { tracker, notify = true }) {
    const oldActive = getters.active._id
    Vue.set(state.index[oldActive], 'active', false)
    Vue.set(state.index[tracker], 'active', true)

    log(`Activating ${tracker} (deactivating tracker <${oldActive}>)`, tracker)

    if (notify) dispatch('notifyActivateTracker', tracker)
  },

  // NOTIFY SERVER
  async notifyTrackerUpdate({ state, dispatch }, id) {
    const response = await this.$axios.$put(`/tracker/${id}`, {
      tracker: state.index[id]
    })

    dispatch('pusher/handleResponse', response, { root: true })

    log(`Notifing server that tracker <${id}> has been UPDATED`, response)
  },
  async notifySetRound({ state, dispatch }, _id) {
    const response = await this.$axios.$put(`/tracker/${_id}/round`, {
      value: state.index[_id].round
    })

    dispatch('pusher/handleResponse', response, { root: true })

    log(`Notifing server that tracker <${_id}> had its round UPDATED`, response)
  },
  async notifyActivateTracker({ state, dispatch }, _id) {
    const response = await this.$axios.$put(`/tracker/active`, {
      tracker: _id
    })

    dispatch('pusher/handleResponse', response, { root: true })

    log(`Notifing server that tracker <${_id}> has been ACTIVATED`, response)
  }
}
