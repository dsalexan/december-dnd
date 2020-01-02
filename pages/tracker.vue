<template>
  <div>
    <!-- CHARACTER_PERMISSIONS {{ characters_with_permissions }} -->
    <v-list three-line>
      <dnd-list-item
        v-for="item in characters_with_permissions"
        :key="item._id"
        :value="item.character"
        :permission="item.permission"
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
      v-if="PERMISSIONS.EDIT"
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

import { defaults } from '../utils/permissions'
import FormCharacter from '@/components/forms/character'
import Filter from '@/components/5etools/filter'

import { characterFilter } from '@/domain/filter'

// console.log('CHARACTER FILTER', characterFilter)

export default {
  components: {
    'form-character': FormCharacter,
    'tool-filter': Filter,
    'dnd-list-item': listItemVue
  },
  data() {
    return {
      fab: false,
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
    ...mapState('characters', {
      CHARACTER_PERMISSIONS: 'permissions'
    }),
    ...mapGetters('characters', {
      character: 'character',
      characters: 'sorted'
    }),
    characters_with_permissions() {
      return this.characters
        .map((char) => {
          const permission = this.CHARACTER_PERMISSIONS[char._id] || defaults('character')

          if (permission.VIEW === false) return undefined

          return {
            character: char,
            permission
          }
        })
        .filter((char) => char !== undefined)
    }
  },
  created() {},
  methods: {
    ...mapMutations('characters', ['add', 'remove', 'set_initiative', 'set_hp']),
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
    max(a, b) {
      return Math.max(a, b)
    },
    openFilter() {
      this.searchDialog = true
      // this.loadBestiary()
    },
    filterChange(entry) {
      console.log('filter change', entry)
      this.add(_.cloneDeep(entry))
    },
    setHp(_id, sum, key = 'current') {
      this.hpDialog = false
      this.hpSum = undefined
      this.hpDialog_id = undefined
      this.hpDialog_plus = false
      this.hpDialog_minus = false

      if (sum === undefined) return

      // console.log('SET HP', _id, sum, key)

      this.set_hp({ _id, value: sum, key })
    },
    onKeyUp(e, _id, key = 'current') {
      const value = this.character(_id)._hp[key]

      const add = e.code === 'ArrowUp' ? +1 : e.code === 'ArrowDown' ? -1 : undefined

      if (add === undefined || value === undefined) return

      this.set_hp({ _id, value: value + add, key })
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
