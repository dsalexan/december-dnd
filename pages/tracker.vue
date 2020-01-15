<template>
  <div>
    <div class="shortkey-buttons">
      <v-btn text color="amber" dark>
        {{ selected }}
      </v-btn>
      <v-btn v-shortkey="['esc']" @shortkey="selected = undefined" @click="selected = undefined" icon color="amber">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-btn v-shortkey="['arrowdown']" @shortkey="handleArrowDown" @click="handleArrowDown" icon color="amber">
        <v-icon>mdi-arrow-down</v-icon>
      </v-btn>
      <v-btn v-shortkey="['arrowup']" @shortkey="handleArrowUp" @click="handleArrowUp" icon color="amber">
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
    </div>
    <!-- CHARACTER_PERMISSIONS {{ characters_with_permissions }} -->
    <!-- <br /> -->
    <!-- GLOBAL_PERMISSIONS {{ VIEW() }} -->
    <v-card v-if="GLOBAL_VIEW('tracker.manager')" tile color="grey darken-4">
      <v-card-text v-if="showTrackerMenu">
        <v-container>
          <v-row no-gutters>
            <v-col cols="12" sm="4">
              <v-text-field
                v-if="PERMISSIONS.EDIT"
                v-model="max_round"
                label="Maximum Round"
                class="mt-0 pt-0"
                dense
                hide-details
                type="number"
                filled
              ></v-text-field>
              <v-slider
                :value="round"
                @change="setRound({ tracker: activeTracker._id, value: $event })"
                :max="max_round"
                class="mt-0 pt-0 align-center"
                hide-details
              >
              </v-slider>
              <div class="white--text" style="text-align: center; width: 100%;">{{ !round ? 'NO ROUND SPECIFIED' : round }}</div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="pa-0">
        <v-btn @click="showTrackerMenu = !showTrackerMenu" color="primary" block text>
          <v-icon>mdi-chevron-{{ !showTrackerMenu ? 'down' : 'up' }}</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-list three-line>
      <dnd-list-item
        v-for="item in characters_with_permissions"
        :key="item.character._id"
        :id="`item-${item.character._id}`"
        :value="item.character"
        :permission="item.permission"
        :selected="selected === item.character._id"
        :hidden="hidden.includes(item.character._id)"
        @change="onChange(item.character._id, $event.action)"
        @remove="onRemove(item.character._id)"
        @click="selected = item.character._id"
        @hide="hidden.push(item.character._id)"
        @show="() => (hidden = hidden.filter((h) => h !== item.character._id))"
      ></dnd-list-item>
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

    <v-dialog v-model="searchDialog">
      <v-card>
        <v-card-title class="title">Search 5eTools</v-card-title>
        <v-card-text>
          <tool-filter @change="filterChange"></tool-filter>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text>Cancel</v-btn>
          <v-btn color="green darken-1" text>Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-speed-dial
      v-if="VIEW('add')"
      v-model="fab"
      open-on-hover
      transition="slide-x-reverse-transition"
      right
      fixed
      bottom
      direction="left"
    >
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

// eslint-disable-next-line no-unused-vars
import { info } from '../utils/debug'
import listItemVue from '../components/dnd/tracker/listItem.vue'

import { defaults, nestedValue } from '../utils/permissions'
import { isValid } from '../utils/value'
import FormCharacter from '@/components/forms/character'
import Filter from '@/components/5etools/filter'

import { characterFilter } from '@/domain/filter'

// info('CHARACTER FILTER', characterFilter)

export default {
  components: {
    'form-character': FormCharacter,
    'tool-filter': Filter,
    'dnd-list-item': listItemVue
  },
  data() {
    return {
      fab: false,
      hidden: [],
      // shortkeys
      selected: undefined,
      // MENU
      showTrackerMenu: false,
      // round
      max_round: 10,
      // hp
      hpDialog: false,
      hpSum: undefined,
      hpDialog_id: undefined,
      hpDialog_plus: false,
      hpDialog_minus: false,
      // form
      formDialog: false,
      formModel: undefined,
      // search
      searchDialog: false,
      filter: characterFilter
    }
  },
  computed: {
    ...mapState('ui', ['PERMISSIONS']),
    ...mapGetters('tracker', {
      round: 'round',
      characters: 'characters',
      activeTracker: 'active'
    }),
    ...mapGetters('characters', {
      character: 'character',
      CHARACTER_PERMISSIONS: 'permissions'
    }),
    ...mapGetters(['GLOBAL_PERMISSIONS']),
    VIEW() {
      return (path) => {
        if (path === undefined) {
          if (this.GLOBAL_PERMISSIONS.view === undefined) return true
          const nested = nestedValue(this.GLOBAL_PERMISSIONS.view)
          return nested === undefined ? true : nested
        }

        const _nested = nestedValue(_.get(this.GLOBAL_PERMISSIONS.view || {}, path))
        return _nested === undefined ? true : _nested
      }
    },
    GLOBAL_VIEW() {
      return (path) => {
        if (path === undefined) {
          if (this.GLOBAL_PERMISSIONS.view === undefined) return true
          const nested = nestedValue(this.GLOBAL_PERMISSIONS.view)
          return nested === undefined ? true : nested
        }

        const _nested = nestedValue(_.get(this.GLOBAL_PERMISSIONS.view || {}, path))
        return _nested === undefined ? true : _nested
      }
    },
    characters_with_permissions() {
      return this.characters
        .map((char) => {
          const permission = this.CHARACTER_PERMISSIONS[char._id] || defaults('character')

          const nested = nestedValue(permission.view)
          const _view = nested === undefined ? true : nested
          if (!_view) return undefined

          return {
            character: char,
            permission
          }
        })
        .filter((char) => char !== undefined)
    }
  },
  created() {
    this.trackerInit()
  },
  methods: {
    ...mapActions('tracker', {
      trackerInit: 'init',
      setRound: 'setRound'
    }),
    ...mapMutations('characters', ['set_initiative', 'set_hp']),
    ...mapActions('characters', ['init', 'add', 'remove', 'notifyCharacterUpdate']),
    handleAddCharacter({ cancel = false, data = {} } = {}) {
      this.formDialog = false
      this.formModel = undefined

      if (!cancel) {
        this.add({
          data: {
            ...data,
            type: {
              type: data.type,
              tags: data.tags
            }
          }
        })
      }
    },
    max(a, b) {
      return Math.max(a, b)
    },
    openFilter() {
      this.searchDialog = true
      // this.loadBestiary()
    },
    filterChange(entry) {
      // info('filter change', entry)
      this.add({ data: _.cloneDeep(entry) })
    },
    setHp(_id, sum, key = 'current') {
      this.hpDialog = false
      this.hpSum = undefined
      this.hpDialog_id = undefined
      this.hpDialog_plus = false
      this.hpDialog_minus = false

      if (sum === undefined) return

      // info('SET HP', _id, sum, key)

      this.set_hp({ _id, value: sum, key })
      this.notifyCharacterUpdate(_id)
    },
    onKeyUp(e, _id, key = 'current') {
      const value = this.character(_id)._hp[key]

      const add = e.code === 'ArrowUp' ? +1 : e.code === 'ArrowDown' ? -1 : undefined

      if (add === undefined || value === undefined) return

      this.set_hp({ _id, value: value + add, key })
      this.notifyCharacterUpdate(_id)
    },
    onChange(_id, action) {
      this.notifyCharacterUpdate({ id: _id, action })
    },
    onRemove(id) {
      this.remove({ id })
    },
    handleArrowDown() {
      const currentIndex =
        this.selected === undefined
          ? undefined
          : this.characters_with_permissions.findIndex((char) => char.character._id === this.selected)

      const value = (isValid(currentIndex) ? currentIndex : -1) + 1
      const nextIndex = value >= this.characters_with_permissions.length ? 0 : value

      this.selected = this.characters_with_permissions[nextIndex].character._id
      this.$vuetify.goTo(`#item-${this.selected}`)
    },
    handleArrowUp() {
      const currentIndex =
        this.selected === undefined
          ? this.characters_with_permissions[0].character._id
          : this.characters_with_permissions.findIndex((char) => char.character._id === this.selected)

      const value = (isValid(currentIndex) ? currentIndex : 1) - 1
      const nextIndex = value < 0 ? this.characters_with_permissions.length + value : value

      this.selected = this.characters_with_permissions[nextIndex].character._id
      this.$vuetify.goTo(`#item-${this.selected}`)
    },
    handleShortKeys(event) {
      switch (event.srcKey) {
        case 'deselect':
          this.selected = undefined
          break
      }
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

<style lang="sass">
.hpDialog
    .v-card__text
      span
        margin: 0 10px
        display: inline-block
        min-height: 48px
        padding: 8px
        font-size: 16px
        // margin-top: 8px
</style>
