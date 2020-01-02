import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

import { modifier } from '@/utils/system'

import Character from '@/domain/character'
// eslint-disable-next-line no-unused-vars
import CharacterMock from '@/domain/character/mock'
import Rolls from '@/utils/rolls'
import { info } from '~/utils/debug'
import { int } from '~/utils/value'
import { defaults } from '~/utils/permissions'

info('CHARACTER MOCK', CharacterMock.characters_index)

info(
  'PERMISSIONS',
  Object.keys(CharacterMock.characters_index).reduce((obj, cur) => ({ ...obj, [cur]: defaults('character') }), {})
)
export const state = () => ({
  index: CharacterMock.characters_index,
  list: CharacterMock.characters,
  permissions: Object.keys(CharacterMock.characters_index).reduce(
    (obj, cur, index) => ({ ...obj, [cur]: defaults(`character${index === 1 ? ':personal' : ':party'}`) }),
    {}
  )
})

export const getters = {
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
    return (_id) => state.index[_id]._pTypes.asText
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
          return images[0].href.path
        }
      } else {
        throw new Error('No HREF property in image')
      }
    }
  },
  // manipulations
  sorted(state, getters) {
    return state.list.sort((a, b) => {
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
  // characters
  add(state, data) {
    const character = Character.make(data)
    const index = state.list.length
    Vue.set(state.list, index, character)
    Vue.set(state.index, character._id, index)
  },
  remove(state, _id) {
    const index = state.index[_id]
    Vue.delete(state.index, _id)

    state.list.splice(index, 1)
    state.list.forEach((item, i) => Vue.set(state.index, item._id, i))
  },
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

export const actions = {}
