<template>
  <v-list three-line>
    <v-list-item v-for="item in sortedCharacters" :key="item.title">
      <v-list-item-action class="align-self-center d-flex align-center">
        <v-hover v-slot:default="{ hover }">
          <v-btn
            :color="hover ? 'blue' : 'grey'"
            :disabled="item._rolls.initiative === undefined"
            @click="handleInitiativeRoll(item._id, { add: 1 })"
            text
            icon
          >
            <v-icon>mdi-chevron-up</v-icon>
          </v-btn>
        </v-hover>
        <v-edit-field
          :value="item._rolls.initiative"
          @input="handleInitiativeRoll(item._id, { value: $event })"
          :add="abilityModifier(item.ability.dex)"
          class="title font-weight-bold"
        ></v-edit-field>
        <v-hover v-slot:default="{ hover }">
          <v-btn
            :color="hover ? 'red' : 'grey'"
            :disabled="item._rolls.initiative === undefined"
            @click="handleInitiativeRoll(item._id, { add: -1 })"
            text
            icon
          >
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </v-hover>
      </v-list-item-action>

      <v-list-item-avatar
        class="align-self-center"
        style="min-width: 72px; margin-right: 32px;"
      >
        <v-avatar size="72">
          <v-img :src="item.avatar"></v-img>
        </v-avatar>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title class="title"
          ><span>{{ item.name }}</span>
          <div class="caption font-italic grey--text text--lighten-1">
            Human &mdash; Monk, The Way of the Zoroaster
          </div></v-list-item-title
        >
        <v-list-item-subtitle>
          <div
            class="abilities d-flex flex-row justify-space-between"
            style="width: 50%"
          >
            <div
              v-for="ability in ['str', 'dex', 'con', 'int', 'wis', 'cha']"
              :key="ability"
              class="ability text-center"
            >
              <div class="name text-uppercase font-weight-bold">
                {{ ability }}
              </div>
              <div class="score amber--text text--darken-1 font-weight-regular">
                {{ item.ability[ability] }} ({{
                  abilityModifier(item.ability[ability], true)
                }})
              </div>
            </div>
          </div>
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action class="align-self-center">
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-hover v-slot:default="{ hover }">
              <v-btn
                :color="hover ? 'amber' : 'grey'"
                @click="handleRollInitiative(item._id)"
                v-on="on"
                text
                icon
              >
                <v-icon>mdi-dice-d20-outline</v-icon>
              </v-btn>
            </v-hover>
          </template>
          <span>Roll Initiative (d20)</span>
        </v-tooltip>

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-hover v-slot:default="{ hover }">
              <v-btn :color="hover ? 'red' : 'grey'" v-on="on" text icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-hover>
          </template>
          <span>Remove Character</span>
        </v-tooltip>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

import VEditField from '@/components/utils/VEditField'

export default {
  components: {
    'v-edit-field': VEditField
  },
  data() {
    return {
      characters: {
        'Luke UndellFendas': {
          _id: 'Luke UndellFendas',
          avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
          name: 'Luke Undell',
          ability: {
            str: 10,
            dex: 14,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10
          },
          _rolls: {
            initiative: '?'
          }
        },
        'Avir YvraniFendas': {
          _id: 'Avir YvraniFendas',
          avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
          name: 'Avir Yvrani',
          ability: {
            str: 10,
            dex: 20,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10
          },
          _rolls: {
            initiative: '?'
          }
        }
      }
    }
  },
  computed: {
    sortedCharacters() {
      return _.cloneDeep(Object.values(this.characters)).sort((a, b) => {
        const initiative = this.initiative(b) - this.initiative(a)
        if (initiative === 0) {
          return (
            this.abilityModifier(b.ability.dex) -
            this.abilityModifier(a.ability.dex)
          )
        } else {
          return initiative
        }
      })
    }
  },
  methods: {
    handleInitiativeRoll(_id, { value = undefined, add = undefined } = {}) {
      if (value !== undefined) {
        let base = parseInt(value)
        if (value === '?' || value === undefined || isNaN(base)) {
          base = 0
        }

        this.characters[_id]._rolls.initiative = base
      }

      if (add !== undefined) {
        if (
          this.characters[_id]._rolls.initiative === '?' ||
          this.characters[_id]._rolls.initiative === undefined
        ) {
          this.characters[_id]._rolls.initiative = 0
        }

        this.characters[_id]._rolls.initiative =
          parseInt(this.characters[_id]._rolls.initiative) + add
      }
    },
    abilityModifier(value, signal = false) {
      value = Math.floor((value - 10) / 2)

      if (signal === false) return value
      return value >= 0 ? `+${value}` : value
    },
    initiative(character) {
      let base = parseInt(character._rolls.initiative)
      if (
        character._rolls.initiative === '?' ||
        character._rolls.initiative === undefined ||
        isNaN(base)
      ) {
        base = 0
      }

      return base + this.abilityModifier(character.ability.dex)
    },
    handleRollInitiative(_id) {
      this.characters[_id]._rolls.initiative =
        Math.floor(Math.random() * (20 - 1 + 1)) + 1
    }
  }
}
</script>

<style lang="sass" scoped>
.v-list::v-deep
  .v-list-item
    display: flex
    align-content: center

.v-edit-field::v-deep
  .v-input
    width: 32px

    input
      text-align: center

.abilities
  .ability
    .name

    .score
</style>
