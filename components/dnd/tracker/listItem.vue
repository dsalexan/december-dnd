<template>
  <v-list-item :class="{ 'view-false': !VIEW() }" class="dnd-initiative-tracker-item">
    <v-list-item-action
      :class="{ 'view-false': !VIEW('initiative') }"
      class="align-self-center d-flex flex-row align-center grid-tracker"
    >
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" @click="handleColorBarClick" :color="color" class="color-bar" depressed></v-btn>
        </template>
        <span>Press SHIFT to add/remove color identifier</span>
      </v-tooltip>

      <v-dialog v-model="colorDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Choose color for {{ value.name }}</v-card-title>
          <v-card-text class="d-flex justify-center">
            <v-color-picker :value="color" @input="handleColor" :swatches="swatches" class="ma-1" show-swatches></v-color-picker>
          </v-card-text>
        </v-card>
      </v-dialog>

      <div class="align-self-center d-flex align-center flex-column">
        <v-hover v-slot:default="{ hover }">
          <v-btn :color="hover ? 'blue' : 'grey'" @click="handleInitiativeRoll({ add: 1 })" text icon>
            <v-icon>mdi-chevron-up</v-icon>
          </v-btn>
        </v-hover>
        <v-edit-field
          :value="value._rolls.initiative"
          @input="handleInitiativeRoll({ value: $event })"
          :add="modifier(value.dex)"
          class="title font-weight-bold"
        ></v-edit-field>
        <v-hover v-slot:default="{ hover }">
          <v-btn :color="hover ? 'red' : 'grey'" @click="handleInitiativeRoll({ add: -1 })" text icon>
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </v-hover>
      </div>
    </v-list-item-action>

    <v-list-item-avatar
      class="align-self-center d-flex flex-column justify-center align-center grid-avatar"
      style="min-width: 72px; margin-right: 32px;"
    >
      <v-avatar @click="avatarOverlay = !!avatar()" size="72" color="amber darken-1">
        <v-img v-if="avatar() && VIEW('avatar')" :src="avatar()"></v-img>
        <span v-else class="black--text headline d-flex align-center" style="height: 72px">{{
          VIEW('avatar') ? abreviattion(value.name) : '?'
        }}</span>
      </v-avatar>
      <v-array-field
        v-if="VIEW('ac') && value.ac && value.ac.length > 0"
        :value="value.ac"
        :preprocessor="ac"
        @input="(event) => (value.ac[event.index].ac = event.value)"
        placeholder="?"
        label="AC"
        class="mt-2"
      ></v-array-field>
    </v-list-item-avatar>

    <v-overlay v-if="VIEW('avatar')" :value="avatarOverlay" @click="avatarOverlay = false">
      <div class="d-flex flex-column justify-center align-center">
        <v-img :src="avatar()" @click="avatarOverlay = false"></v-img>
        <v-btn @click="avatarOverlay = false" icon class="mt-2">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-overlay>

    <v-list-item-content class="grid-main">
      <v-list-item-title class="title">
        <div>
          <span>{{ VIEW('name') ? value.name : '??' }}</span>
          <span v-if="VIEW('source')" class="grey--text subtitle-1 font-weight-black ml-3">{{ value.source }} </span>
        </div>
        <div
          v-if="VIEW('type') || VIEW('level') || VIEW('cr')"
          class="caption grey--text text--lighten-1"
          style="margin-top: -6px; overflow: auto;"
        >
          <span v-if="VIEW('type')" class="font-italic">{{ value._pTypes.asText }} &mdash;</span>
          <span v-if="VIEW('cr') || VIEW('level')" class="font-italic">{{ level_or_cr() }}</span>
        </div>
      </v-list-item-title>
      <v-list-item-subtitle>
        <div
          v-if="VIEW('abilities')"
          class="abilities d-flex flex-row justify-space-between mt-2"
          style="width: 50%; min-width: 350px;"
        >
          <div v-for="ability in ['str', 'dex', 'con', 'int', 'wis', 'cha']" :key="ability" class="ability text-center">
            <div class="name text-uppercase font-weight-bold">
              {{ ability }}
            </div>
            <div class="score amber--text text--darken-1 font-weight-regular">
              <template v-if="VIEW('abilities.value') && ability in value">
                {{ value[ability] }} ({{ modifier(value[ability], true) }})
              </template>
              <template v-else>
                ?
              </template>
            </div>
          </div>
        </div>
        <div v-if="VIEW('tags')" class="tags mt-4 d-flex flex-row flex-wrap">
          <v-tags
            v-if="VIEW('tags.speed')"
            :editable="PERMISSIONS.EDIT"
            :value="value.speed"
            :preprocessor="speed"
            @input="
              (event) => {
                lodashSet(value.speed, [event.item.key, ...event.path], event.value)
              }
            "
            :source="{
              type: 'object',
              key: ['walk', 'burrow', 'climb', 'fly', 'swim']
            }"
            :template="[
              1,
              {
                number: 1,
                condition: ''
              }
            ]"
            title="Speed"
            label="Speed"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.saves')"
            :editable="PERMISSIONS.EDIT"
            :value="saves(value)"
            @input="
              (event) => {
                lodashSet(value.save, [event.item.key, ...event.path], event.value)
              }
            "
            :source="{
              type: 'object',
              key: ATRIBUTES
            }"
            :template="[
              true,
              {
                proficiency_ratio: 1.1,
                bonus: 1
              }
            ]"
            title="Saving Throws"
            label="Proficient"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.skills')"
            :editable="PERMISSIONS.EDIT"
            :value="skills(value)"
            @input="
              (event) => {
                lodashSet(value.skill, [event.item.key, ...event.path], event.value)
              }
            "
            :source="{
              type: 'object',
              key: SKILLS
            }"
            :template="[
              true,
              {
                proficiency_ratio: 1.1,
                bonus: 1
              }
            ]"
            title="Skills"
            label="Proficient"
          ></v-tags>
          <v-tags
            :editable="PERMISSIONS.EDIT"
            v-for="immRes in [
              { key: 'vulnerable', title: 'Vulnerabilities', label: 'Vulnerability' },
              { key: 'resist', title: 'Resistances', label: 'Resistance' },
              { key: 'immune', title: 'Immunities', label: 'Immunity' }
            ].filter((ir_obj) => !!VIEW(`tags.${ir_obj.key}`))"
            :key="immRes.key"
            :value="immunitiesResistances(value[immRes.key])"
            @input="
              (event) => {
                lodashSet(value[immRes.key], [...event.item.key, ...event.path], event.value)
              }
            "
            :title="`DMG. ${immRes.title}`"
            :label="immRes.label"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.conditionImmune')"
            :editable="PERMISSIONS.EDIT"
            :value="conditionImmunities(value.conditionImmune)"
            @input="
              (event) => {
                lodashSet(value.conditionImmune, [event.item.key, ...event.path], event.value)
              }
            "
            title="Condition Immunities"
            label="Immunity"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.senses')"
            :editable="PERMISSIONS.EDIT"
            :value="senses(value)"
            @input="
              (event) => {
                if (event.item.key === 'passive') {
                  lodashSet(value.skill, ['perception', ...event.path], event.value)
                } else {
                  lodashSet(value.senses, [event.item.key, ...event.path], event.value)
                }
              }
            "
            :source="{
              type: 'array',
              key: (value.senses || []).length
            }"
            :template="[
              '',
              {
                name: '',
                value: 1,
                condition: ''
              }
            ]"
            title="Senses"
            label="Sense"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.languages')"
            :editable="PERMISSIONS.EDIT"
            :value="languages(value.languages)"
            @input="
              (event) => {
                lodashSet(value.languages, [event.item.key, ...event.path], event.value)
              }
            "
            :source="{
              type: 'array',
              key: (value.languages || []).length
            }"
            :template="[
              {
                _type: 'string',
                _items: LANGUAGES,
                _custom: true
              }
            ]"
            title="Languages"
            label="Language"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags._conditions')"
            :editable="PERMISSIONS.EDIT"
            :value="conditions(value._conditions)"
            @input="
              (event) => {
                lodashSet(value._conditions, [event.item.key, ...event.path], event.value)
              }
            "
            :source="{
              type: 'array',
              key: (value._conditions || []).length
            }"
            :template="[
              {
                _type: 'string',
                _items: CONDITIONS
              },
              {
                name: {
                  _type: 'string',
                  _items: CONDITIONS
                },
                value: 1,
                condition: ''
              }
            ]"
            title="Conditions"
            label="Condition"
          ></v-tags>
        </div>
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action v-if="VIEW('_hp')" class="align-self-center grid-hp">
      <dnd-hp :value="value._hp"></dnd-hp>
    </v-list-item-action>

    <v-list-item-action class="align-self-center grid-actions">
      <v-tooltip v-if="VIEW('_rolls') && VIEW('_rolls.initiative')" left>
        <template v-slot:activator="{ on }">
          <v-hover v-slot:default="{ hover }">
            <v-btn
              :color="hover ? 'amber' : hasRolled('initiative') ? 'grey' : 'white'"
              @click="rollInitiative()"
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

      <v-tooltip v-if="PERMISSIONS.EDIT" left>
        <template v-slot:activator="{ on }">
          <v-hover v-slot:default="{ hover }">
            <v-btn :color="hover ? 'red' : 'grey'" v-on="on" @click="handleRemove()" text icon>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-hover>
        </template>
        <span>Remove Character</span>
      </v-tooltip>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import { info } from '../../../utils/debug'
// eslint-disable-next-line no-unused-vars
import VArrayFieldVue from '../../utils/VArrayField/index.vue'
import VTagsVue from '../../utils/VTags.vue'
import { vueSet } from '../../../utils/object'
import { LIST_ABBREVIATIONS } from '../../../utils/system/constants/abilities'
import { LIST_SKILLS } from '../../../utils/system/constants/skills'
import { LIST_CONDITIONS } from '../../../utils/system/constants/conditions'
import { LIST_LANGUAGES } from '../../../utils/system/constants/languages'
import { defaults } from '../../../utils/permissions'
import { int, isValid } from '@/utils/value'
import hpVue from '@/components/dnd/tracker/hp.vue'
import { modifier } from '@/utils/system'
import VEditField from '@/components/utils/VEditField'

import CHARACTER from '@/domain/character'

export default {
  components: {
    'dnd-hp': hpVue,
    'v-edit-field': VEditField,
    // eslint-disable-next-line vue/no-unused-components
    'v-array-field': VArrayFieldVue,
    'v-tags': VTagsVue
  },
  props: {
    value: {
      type: Object,
      default: () => ({
        _id: 'John Doe#FCS',
        name: 'John Doe',
        source: 'FCS',
        _fluf: {},
        _rolls: {},
        _color: '#000000'
      })
    },
    permission: {
      type: Object,
      default: () => ({ VIEW: true })
    }
  },
  data() {
    if (!isValid(this.permissions)) this.permissions = defaults('character')

    return {
      // constants
      ATRIBUTES: LIST_ABBREVIATIONS,
      SKILLS: LIST_SKILLS,
      LANGUAGES: LIST_LANGUAGES,
      CONDITIONS: LIST_CONDITIONS,
      // data
      colorDialog: false,
      swatches: [
        ['#000000', '#FF0000', '#AA0000', '#550000'],
        ['#212121', '#FFFF00', '#AAAA00', '#555500'],
        ['#757575', '#00FF00', '#00AA00', '#005500'],
        ['#E0E0E0', '#00FFFF', '#00AAAA', '#005555'],
        ['#F5F5F5', '#0000FF', '#0000AA', '#000055']
      ],
      avatarOverlay: false
    }
  },
  computed: {
    ...mapState('ui', ['PERMISSIONS']),
    VIEW() {
      return (path) => {
        if (path === undefined) return this.permission.view === undefined ? true : this.permission.view
        return _.get(this.permission.view || {}, path)
      }
    },
    color() {
      const color = this.$props.value._color === undefined ? '#616161' : this.$props.value._color
      return color.hex || color
    }
  },
  mounted() {
    info('Mounted List Item', this.$props.value)
  },
  methods: {
    lodashSet: vueSet,
    modifier,
    hasRolled: CHARACTER.hasRolled,
    ac: CHARACTER.acToArray,
    speed: CHARACTER.speedToArray,
    skills: CHARACTER.skillsToArray,
    saves: CHARACTER.savesToArray,
    senses: CHARACTER.sensesToArray,
    languages: CHARACTER.languagesToArray,
    immunitiesResistances: CHARACTER.immunitiesAndResistancesToArray,
    conditionImmunities: CHARACTER.conditionImmunitiesToArray,
    conditions: CHARACTER.conditionsToArray,
    abreviattion(name) {
      return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    },
    avatar() {
      const _images = (this.$props.value._fluff && this.$props.value._fluff.images) || []
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
    },
    level_or_cr() {
      const crLevel = this.$props.value._fCrLevel
      if (crLevel.level) return crLevel.display
      else return `CR ${crLevel.display}`
    },
    // GENERAL
    rollInitiative() {
      const name = this.$props.value.name

      const value = Math.floor(Math.random() * (20 - 1 + 1)) + 1
      this.$toast({
        supportHTML: true,
        message: `<span class="grey"><i>${name}</i> &mdash; Rolling initiative:</span> <b>${value}</b>`,
        position: 'bottom-center'
      })
      this.handleInitiativeRoll({
        value
      })
    },
    // EVENTS
    handleColorBarClick(event) {
      const open = this.$props.value._color !== undefined

      if (event.shiftKey) {
        if (!open) {
          this.$set(this.$props.value, '_color', '#000000')
          this.colorDialog = true
        } else {
          this.$set(this.$props.value, '_color', undefined)
          this.colorDialog = false
        }
      } else {
        this.colorDialog = open
      }
    },
    handleColor(event) {
      this.$props.value._color = event
    },
    handleInitiativeRoll({ add, value }) {
      // this.set_initiative({ _id, value, add })
      // this.$emit('initiative', { add, value })
      if (value !== undefined) {
        this.$set(this.$props.value._rolls, 'initiative', int(value, undefined))
      }

      if (add !== undefined) {
        this.$set(this.$props.value._rolls, 'initiative', this.$props.value._rolls.initiative + int(add, 0))
      }
    },
    handleRemove() {
      const name = this.$props.value.name

      this.$toast({
        supportHTML: true,
        message: `<span class="grey">Removing character:</span> <b>${name}</b>`,
        position: 'bottom-center'
      })
      // this.remove(_id)
      this.$emit('remove')
    }
  }
}
</script>

<style lang="sass" scoped>
.view-false
  display: none !important

.dnd-initiative-tracker-item
  .v-edit-field::v-deep
    .v-input
      width: 32px

      input
        text-align: center

  .color-bar::v-deep
    width: 5px
    min-width: 5px
    padding: 0
    height: 42px
    margin-right: 5px


  @media (max-width: 600px)
    &.v-list-item::v-deep
      display: grid !important
      grid-template-columns: calc(50px + 32px) auto calc(36px + 16px)
      grid-template-rows: auto auto auto
      grid-template-areas:  "tracker  avatar  actions" "main main  main" "hp  hp  hp"

      .grid-tracker
        grid-area: tracker
        margin-bottom: 0

      .grid-avatar
        grid-area: avatar
        flex-direction: row !important
        width: auto !important
        margin-right: 0 !important
        justify-content: flex-start !important

        > .v-avatar
          margin-right: 16px

      .grid-main
        grid-area: main

      .grid-hp
        margin: 0 -16px
        padding: 12px 16px
        margin-top: 5px
        margin-bottom: 20px
        background: #212121
        grid-area: hp
        display: flex
        flex-direction: row

      .grid-actions
        grid-area: actions


    .v-list-item-action
</style>
