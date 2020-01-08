import Pusher from 'pusher-js'
import _ from 'lodash'

import { isValid } from '~/utils/value'
import { not } from '~/utils/debug'

const logIgnore = not.extend('ignore')

export const state = () => ({
  client: undefined,
  ignore: []
})

export const actions = {
  init({ state }) {
    state.client = new Pusher('605e2e08d813deb91748', {
      cluster: 'us2'
    })

    state.client.subscribe('december')
  },
  handleResponse({ state }, response) {
    if (isValid(response.ignore)) {
      const ignore = _.isArray(response.ignore) ? response.ignore : [response.ignore]
      state.ignore.splice(state.ignore.length, 0, ...ignore.filter((hash) => !state.ignore.includes(hash)))
    }
  },
  bind({ state }, { event, callback, logReplace }) {
    state.client.bind(event, (data) => {
      let log_string = `(${data.hash}) ${event}${data.path.length <= 0 ? '' : ` | ${data.path.join('.')}`}`

      if (logReplace) {
        log_string = log_string.replace(logReplace.regex, logReplace.by)
      }

      not(log_string, data.data, 'from', data.from)

      if (!state.ignore.includes(data.hash)) {
        callback(data)
      } else {
        logIgnore(`(${data.hash}) ${event}`)
        // se bater uma resposta de notificaçao que é para ser ignorada, ignora
        // mas daqui a 5 minutos, remove a hash da lista de ignorados
        setTimeout(() => {
          state.ignore.splice(state.ignore.findIndex(data.hash), 1)
          logIgnore(`Removing hash (${data.hash}) from index`)
        }, 5 * 60 * 1000)
      }
    })
  }
}
