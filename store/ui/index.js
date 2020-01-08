import { info } from '~/utils/debug'

// eslint-disable-next-line no-unused-vars
const log = info.extend('ui')

export const state = () => ({
  PERMISSIONS: {
    EDIT: false
  },
  LAST_ACTIVE: undefined,
  IDLE: false,
  IDLE_INTERVAL: undefined,
  LAST_AM_ONLINE: undefined
})

export const mutations = {
  toogleEdit(state, value = undefined) {
    state.PERMISSIONS.EDIT = value === undefined ? !state.PERMISSIONS.EDIT : value
  }
}

export const actions = {
  reset({ state }) {
    state.PERMISSIONS.EDIT = false
  },
  init({ dispatch }) {
    dispatch('pingStatus')
  },
  pingStatus({ state, dispatch }) {
    const IDLE_TIME = 6 * 60 * 1000
    const E = 100

    state.IDLE_INTERVAL = setInterval(function() {
      state.IDLE = Math.abs(state.LAST_ACTIVE - new Date()) - E >= IDLE_TIME

      const shouldDispatch =
        state.LAST_AM_ONLINE === undefined || Math.abs(state.LAST_AM_ONLINE - new Date()) >= IDLE_TIME - 10 * 1000 - E

      if (!state.IDLE && shouldDispatch) {
        state.LAST_AM_ONLINE = new Date()
        // log('dispatch AM ONLINE')
        dispatch('amOnline', undefined, { root: true })
      }
    }, 1000)
  },
  setActive({ state, dispatch }) {
    state.LAST_ACTIVE = new Date()
    state.IDLE = false
  }
}
