// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

import { sort } from '~/utils/sort'
import { extend, defaults } from '~/utils/permissions'
import { isValid } from '~/utils/value'
import { info, error } from '~/utils/debug'

// const BASE_URL = 'http://63de7184.ngrok.io'

const log = info.extend('users')

export const state = () => ({
  index: {}
})

export const getters = {
  sorted(state, getters, rootState) {
    return Object.values(state.index)
      .sort((a, b) => sort(new Date(a.__last_session.__timestamp), new Date(b.__last_session.timestamp)))
      .filter((user) => {
        return user._id !== '@ADMIN'
      })
  },
  permission(state) {
    return (user, scope) => {
      if (scope === '__GLOBAL__') {
        const _default = (state.index[user].permissions.defaults || {}).__GLOBAL__

        return extend(_default || 'global', state.index[user].permissions.__GLOBAL__)
      } else {
        const _default = (state.index[user].permissions.defaults || {}).__CHARACTER__

        const p = state.index[user].permissions.__CHARACTER__[scope]

        return _.isString(p)
          ? defaults(p)
          : isValid(p) && _.isObjectLike(p)
          ? extend(_default || 'character', p)
          : defaults(_default || 'character:hidden')
      }
    }
  }
}

export const actions = {
  init({ dispatch }) {
    dispatch('fetch')
    dispatch('subscribe')
  },
  subscribe({ state, dispatch, rootState }) {
    rootState.pusher.client.bind('user:updated')

    dispatch(
      'pusher/bind',
      {
        event: 'user:updated',
        callback: ({ hash, from, data, path }) => {
          // debugger
          // not('user:updated', from, data, path)
          if (path.length === 0) {
            dispatch('updateUser', data.user)
          } else if (_.isEqual(path, ['status'])) {
            dispatch('updateStatus', { ...data })
          } else if (path[0] === 'permissions') {
            dispatch('updatePermissions', { ...data })
          }
        }
      },
      { root: true }
    )

    log('Subscribed to notifications channel at pusher (december)')
  },
  // NOTIFICATIONS SHIT
  updateStatus({ state }, { user, status, last_session }) {
    if (user in state.index) {
      state.index[user].__last_session = last_session
      state.index[user].status = status
    } else {
      error(`User <${user}> is not in user's index`)
    }
  },
  updateUser() {
    log('UPDATE USER')
  },
  updatePermissions({ state }, { user, permissions }) {
    state.index[user].permissions.defaults = permissions.defaults

    function getDefault(scope, string) {
      return (state.index[user].permissions.defaults || {})[scope] || string
    }

    state.index[user].permissions.__GLOBAL__ = extend(getDefault('__GLOBAL__', 'global'), permissions.__GLOBAL__)

    state.index[user].permissions.__CHARACTER__ = {}
    for (const key of Object.keys(permissions.__CHARACTER__))
      state.index[user].permissions.__CHARACTER__[key] = _.isString(permissions.__CHARACTER__[key])
        ? defaults(permissions.__CHARACTER__[key])
        : isValid(permissions.__CHARACTER__[key])
        ? extend(getDefault('__CHARACTER__', 'character'), permissions.__CHARACTER__[key])
        : defaults(getDefault('__CHARACTER__', 'character:hidden'))
  },
  // API SHIT
  async fetch({ state, rootState }) {
    const index = await this.$axios.$get(`/users?asIndex=true`)

    // for (const user_id in index) {

    //   index[user_id].permissions.__GLOBAL__ = extend(getDefault('__GLOBAL__', 'global'), index[user_id].permissions.__GLOBAL__)
    //   // index[user_id].__CHARACTER__[key] = extend('character:party', index[user_id].permissions.__CHARACTER__[key])
    //   for (const key of Object.keys(rootState.characters.index || {}))
    //     index[user_id].permissions.__CHARACTER__[key] = _.isString(index[user_id].permissions.__CHARACTER__[key])
    //       ? defaults(index[user_id].permissions.__CHARACTER__[key])
    //       : isValid(index[user_id].permissions.__CHARACTER__[key])
    //       ? extend(getDefault('__CHARACTER__', 'character'), index[user_id].permissions.__CHARACTER__[key])
    //       : defaults(getDefault('__CHARACTER__', 'character:hidden'))
    // }

    log(`Fetched user list from API (${Object.keys(index).length} entries)`, index)
    state.index = index
  },
  async notifyUserPermissionUpdated({ state, dispatch }, { user, permissions }) {
    if (!isValid(user) || !isValid(state.index[user])) {
      error(`User <${user}> is not indexed`)
      return
    }
    const response = await this.$axios.$put(`/users/${user}/permissions`, {
      permissions
    })

    dispatch('pusher/handleResponse', response, { root: true })

    log(`Notifing server that permissions for user <${user}> have been UPDATED`, permissions, response)
  }
}
