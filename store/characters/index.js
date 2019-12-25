import Vue from 'vue'
import _ from 'lodash'

import { modifier } from '@/utils/system'

import Character from '@/domain/character'
import CharacterMock from '@/domain/character/mock'
import Rolls from '@/utils/rolls'

export const state = () => ({
  index: CharacterMock.characters_index
})

export const getters = {
  // values
  character(state, getters) {
    return (_id) => state.index[_id]
  },
  initiative(state, getters) {
    return (_id) => {
      return Character.initiative(state.index[_id])
    }
  },
  creature_type(state) {
    return (_id) => state.index[_id].type.asText
  },
  level_or_cr(state) {
    return (_id) => Character.creatureLevelCRText(state.index[_id])
  },
  background(state) {
    return (_id) => state.index[_id].background
  },
  // manipulations
  sorted(state, getters) {
    return _.cloneDeep(Object.values(state.index)).sort((a, b) => {
      const initiative = Character.initiative(b) - Character.initiative(a)
      if (initiative === 0) {
        return modifier(b.ability.dex) - modifier(a.ability.dex)
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
    Vue.set(state.index, character._id, character)
  },
  remove(state, _id) {
    Vue.delete(state.index, _id)
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
      const roll = parseInt(state.index._rolls.initiative)

      state.index[_id]._rolls.initiative = (hasRolled ? roll : 0) + add
    }
  }
}

export const actions = {}
