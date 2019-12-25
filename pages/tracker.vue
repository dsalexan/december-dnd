<template>
  <div>
    <v-list three-line>
      <v-list-item v-for="item in characters" :key="item.title">
        <v-list-item-action class="align-self-center d-flex align-center">
          <v-hover v-slot:default="{ hover }">
            <v-btn :color="hover ? 'blue' : 'grey'" @click="handleInitiativeRoll(item._id, { add: 1 })" text icon>
              <v-icon>mdi-chevron-up</v-icon>
            </v-btn>
          </v-hover>
          <v-edit-field
            :value="item._rolls.initiative"
            @input="handleInitiativeRoll(item._id, { value: $event })"
            :add="modifier(item.ability.dex)"
            class="title font-weight-bold"
          ></v-edit-field>
          <v-hover v-slot:default="{ hover }">
            <v-btn :color="hover ? 'red' : 'grey'" @click="handleInitiativeRoll(item._id, { add: -1 })" text icon>
              <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
          </v-hover>
        </v-list-item-action>

        <v-list-item-avatar class="align-self-center" style="min-width: 72px; margin-right: 32px;">
          <v-avatar size="72" color="amber darken-1">
            <v-img v-if="item.avatar" :src="item.avatar"></v-img>
            <span v-else class="black--text headline">{{ abreviattion(item) }}</span>
          </v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="title"
            ><span>{{ item.name }}</span>
            <div class="caption grey--text text--lighten-1">
              <span class="font-italic">{{ creature_type(item._id) }} &mdash;</span>
              <span class="font-italic">{{ background(item._id) ? `${background(item._id)} &mdash;` : '' }}</span>
              <span v-html="level_or_cr(item._id, true)"></span></div
          ></v-list-item-title>
          <v-list-item-subtitle>
            <div class="abilities d-flex flex-row justify-space-between" style="width: 50%; min-width: 350px;">
              <div v-for="ability in ['str', 'dex', 'con', 'int', 'wis', 'cha']" :key="ability" class="ability text-center">
                <div class="name text-uppercase font-weight-bold">
                  {{ ability }}
                </div>
                <div class="score amber--text text--darken-1 font-weight-regular">
                  {{ item.ability[ability] }} ({{ modifier(item.ability[ability], true) }})
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
                  :color="hover ? 'amber' : hasRolled(item._id) ? 'grey' : 'white'"
                  @click="rollInitiative(item._id)"
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
                <v-btn :color="hover ? 'red' : 'grey'" v-on="on" @click="handleRemove(item._id)" text icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-hover>
            </template>
            <span>Remove Character</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-dialog v-model="formDialog" persistent>
      <v-card v-if="formDialog">
        <v-card-title class="title">Add Custom Character</v-card-title>
        <v-card-text>
          <form-character v-model="formModel"></form-character>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="handleAddCharacter({ cancel: true })" color="red darken-1" text>Cancel</v-btn>
          <v-btn @click="handleAddCharacter({ data: formModel })" color="green darken-1" text>Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="searchDialog" persistent>
      <v-card v-if="searchDialog">
        <v-card-title class="title">Search 5eTools</v-card-title>
        <v-card-text>
          <tool-filter :filter="filter"></tool-filter>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text>Cancel</v-btn>
          <v-btn color="green darken-1" text>Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-speed-dial v-model="fab" open-on-hover transition="slide-x-reverse-transition" right fixed bottom direction="left">
      <template v-slot:activator>
        <v-btn v-model="fab" color="amber darken-2" dark fab right>
          <v-icon v-if="fab">mdi-close</v-icon>
          <v-icon v-else>mdi-account-supervisor-circle</v-icon>
        </v-btn>
      </template>
      <v-btn @click="openFilter()" fab dark small color="blue darken-2">
        <v-icon>mdi-toolbox</v-icon>
      </v-btn>
      <v-btn @click="formDialog = true" fab dark small color="green darken-2">
        <v-icon>mdi-account-plus</v-icon>
      </v-btn>
    </v-speed-dial>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import { modifier } from '@/utils/system'

import VEditField from '@/components/utils/VEditField'
import FormCharacter from '@/components/forms/character'
import Filter from '@/components/5etools/filter'

import { characterFilter } from '@/domain/filter'

console.log('CHARACTER FILTER', characterFilter)

export default {
  components: {
    'v-edit-field': VEditField,
    'form-character': FormCharacter,
    'tool-filter': Filter
  },
  data() {
    return {
      fab: false,
      // form
      formDialog: false,
      formModel: undefined,
      // search
      searchDialog: false,
      filter: characterFilter
    }
  },
  computed: {
    ...mapGetters('characters', {
      character: 'character',
      characters: 'sorted',
      hasRolled: 'hasRolled',
      initiative: 'initiative',
      creature_type: 'creature_type',
      level_or_cr: 'level_or_cr',
      background: 'background'
    })
  },
  methods: {
    ...mapMutations('characters', ['add', 'remove', 'set_initiative']),
    handleInitiativeRoll(_id, { value = undefined, add = undefined } = {}) {
      this.set_initiative({ _id, value, add })
    },
    handleAddCharacter({ cancel = false, data = {} } = {}) {
      this.formDialog = false
      this.formModel = undefined

      if (!cancel) {
        this.add({
          ...data,
          type: {
            type: data.type,
            tags: data.tags
          }
        })
      }
    },
    handleRemove(_id) {
      this.$toast({
        supportHTML: true,
        message: `<span class="grey">Removing character:</span> <b>${this.character(_id).name}</b>`,
        position: 'bottom-center'
      })
      this.remove(_id)
    },
    rollInitiative(_id) {
      const value = Math.floor(Math.random() * (20 - 1 + 1)) + 1
      this.$toast({
        supportHTML: true,
        message: `<span class="grey"><i>${this.character(_id).name}</i> &mdash; Rolling initiative:</span> <b>${value}</b>`,
        position: 'bottom-center'
      })
      this.handleInitiativeRoll(_id, {
        value
      })
    },

    modifier,
    abreviattion(character) {
      return character.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    },
    openFilter() {
      this.searchDialog = true
      // this.loadBestiary()
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
