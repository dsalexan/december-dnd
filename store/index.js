import _ from 'lodash'
import Pusher from 'pusher-js'

import { extend, defaults } from '~/utils/permissions'
import { isValid } from '~/utils/value'
import { info } from '~/utils/debug'

export const strict = false

export const state = () => ({
  _id: undefined,
  me: undefined,
  __pusher__: undefined,
  debug: (...args) => info(...args)
})

export const getters = {
  STORE(state, getters, rootState) {
    return rootState
  },
  GLOBAL_PERMISSIONS(state) {
    if (!isValid(state.me)) return defaults('global')
    return state.me.permissions.__GLOBAL__
  }
}

export const actions = {
  init({ dispatch, rootState }) {
    rootState.pusher.client = new Pusher('605e2e08d813deb91748', {
      cluster: 'us2'
    })

    rootState.pusher.client.subscribe('december')
    // dispatch('pusher/init', undefined, { root: true })
    dispatch('subscribe')
  },
  subscribe({ state, dispatch, rootState }) {
    dispatch(
      'pusher/bind',
      {
        event: 'user:updated',
        callback: ({ hash, from, data, path }) => {
          // debugger
          if (data.user._id || data.user === state._id) {
            if (path.length === 0) {
              // debugger
              dispatch('updateMe', data.user)
            } else if (path[0] === 'permissions') {
              dispatch('updatePermissions', data.permissions)
            }
          }
        },
        logReplace: {
          regex: /user:/gi,
          by: 'me:'
        }
      },
      { root: true }
    )

    info('Subscribed to notifications channel at pusher (december)')
  },
  // API RELATED
  async signIn({ state, dispatch }, player) {
    info('SIGN IN UP', player)
    state._id = player
    state.debug = info.extend(player)

    try {
      await this.$axios.$post(`/users`, {
        player: state._id
      })
    } finally {
      await dispatch('amOnline')
      const { data } = await this.$axios.$get(`/users/${state._id}`)

      dispatch('updateMe', data)
    }
  },
  async amOnline({ state }) {
    if (!isValid(state._id)) return
    const response = await this.$axios.$put(`/users/${state._id}/status?status=online`)
    state.debug(`Going ONLINE`, response)
  },
  async amOffline({ state }) {
    if (!isValid(state._id)) return
    const response = await this.$axios.$put(`/users/${state._id}/status?status=offline`)
    debugger
    state.debug(`Going OFFLINE`, response)
  },
  // STORE RELATED
  updateMe({ state }, me) {
    function getDefault(scope, string) {
      return (me.permissions.defaults || {})[scope] || string
    }

    me.permissions.__GLOBAL__ = extend(getDefault('__GLOBAL__', 'global'), me.permissions.__GLOBAL__)

    // me.__CHARACTER__[key] = extend('character:hidden', me.permissions.__CHARACTER__[key])
    for (const key of Object.keys(me.permissions.__CHARACTER__))
      me.permissions.__CHARACTER__[key] = _.isString(me.permissions.__CHARACTER__[key])
        ? defaults(me.permissions.__CHARACTER__[key])
        : isValid(me.permissions.__CHARACTER__[key])
        ? extend(getDefault('__CHARACTER__', 'character'), me.permissions.__CHARACTER__[key])
        : defaults(getDefault('__CHARACTER__', 'character:hidden'))

    state.debug(`Me data updated`, me, me.status)
    state.me = me
  },
  updatePermissions({ state, dispatch }, permissions) {
    state.me.permissions.defaults = permissions.defaults

    function getDefault(scope, string) {
      return (state.me.permissions.defaults || {})[scope] || string
    }

    state.me.permissions.__GLOBAL__ = extend(getDefault('__GLOBAL__', 'global'), permissions.__GLOBAL__)

    state.me.permissions.__CHARACTER__ = {}
    for (const key of Object.keys(permissions.__CHARACTER__))
      state.me.permissions.__CHARACTER__[key] = _.isString(permissions.__CHARACTER__[key])
        ? defaults(permissions.__CHARACTER__[key])
        : isValid(permissions.__CHARACTER__[key])
        ? extend(getDefault('__CHARACTER__', 'character'), permissions.__CHARACTER__[key])
        : defaults(getDefault('__CHARACTER__', 'character:hidden'))

    dispatch('ui/reset', undefined, { root: true })

    state.debug(`Me permissions updated`, permissions)
  }
}
