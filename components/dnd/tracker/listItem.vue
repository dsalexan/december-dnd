<template>
  <v-list-item
    :class="{ 'view-false': !VIEW(), 'zIndex-1000': avatarOverlay }"
    :style="selected ? 'background: #343434;' : ' opacity: 0.95'"
    class="dnd-initiative-tracker-item"
  >
    <!-- {{ selected }} -->
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
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-hover v-slot:default="{ hover }">
              <v-btn :color="hover ? 'blue' : 'grey'" v-on="on" @click="handleInitiativeRoll({ add: 1 })" text icon>
                <v-icon>mdi-chevron-up</v-icon>
              </v-btn>
            </v-hover>
          </template>
          <span>Increase Initiative (Alt + <v-icon small>mdi-arrow-up</v-icon>)</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-edit-field
              ref="edit-initiative"
              :value="value._rolls.initiative"
              @input="handleInitiativeRoll({ value: $event })"
              @focus="focused_initiative = true"
              @blur="focused_initiative = false"
              :add="modifier(value.dex)"
              v-on="on"
              class="title font-weight-bold"
            ></v-edit-field>
          </template>
          <span>Input Initiative (Shift + I)</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-hover v-slot:default="{ hover }">
              <v-btn :color="hover ? 'red' : 'grey'" v-on="on" @click="handleInitiativeRoll({ add: -1 })" text icon>
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </v-hover>
          </template>
          <span>Decrease Initiative (Alt + <v-icon small>mdi-arrow-down</v-icon>)</span>
        </v-tooltip>
      </div>
    </v-list-item-action>

    <div v-if="selected" class="shortkey-buttons flex-column">
      <v-btn
        v-if="selected_tag !== undefined"
        v-shortkey="['esc']"
        @shortkey="selected_tag = undefined"
        @click="selected_tag = undefined"
        icon
        color="amber"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-btn
        v-shortkey="['alt', 'arrowup']"
        @shortkey="handleInitiativeRoll({ add: 1 })"
        @click="handleInitiativeRoll({ add: 1 })"
        small
        icon
        color="amber"
      >
        <v-icon small>mdi-arrow-up</v-icon>
      </v-btn>
      <v-btn
        v-shortkey="['alt', 'arrowdown']"
        @shortkey="handleInitiativeRoll({ add: -1 })"
        @click="handleInitiativeRoll({ add: -1 })"
        small
        icon
        color="amber"
      >
        <v-icon small>mdi-arrow-down</v-icon>
      </v-btn>
      <v-btn v-shortkey="['i']" @shortkey="rollInitiative" @click="rollInitiative" small icon color="amber">
        <v-icon small>mdi-dice-d20-outline</v-icon>
      </v-btn>
      <v-btn v-shortkey="['shift', 'i']" @shortkey="focusInitiative()" @click="focusInitiative()" small icon color="amber">
        <v-icon small>mdi-speedometer</v-icon>
      </v-btn>
      <v-btn v-shortkey="['arrowright']" @shortkey="handleArrowRight" @click="handleArrowRight" small icon color="amber">
        <v-icon small>mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn v-shortkey="['arrowleft']" @shortkey="handleArrowLeft" @click="handleArrowLeft" small icon color="amber">
        <v-icon small>mdi-arrow-left</v-icon>
      </v-btn>
    </div>

    <v-list-item-avatar
      class="align-self-center d-flex flex-column justify-center align-center grid-avatar"
      style="min-width: 72px; margin-right: 32px;"
    >
      <v-avatar @click="avatarOverlay = !!avatar()" :color="!avatar() ? 'amber darken-1' : 'grey darken-4'" size="72">
        <v-img v-if="avatar() && croppedAvatar() === undefined" :src="avatar()"></v-img>
        <v-cropping-image v-else-if="avatar() && croppedAvatar()" :src="avatar()" :crop="croppedAvatar()"></v-cropping-image>
        <span v-else class="black--text headline d-flex align-center" style="height: 72px">{{
          VIEW('avatar') ? abreviattion(value.name) : '?'
        }}</span>
      </v-avatar>
      <v-array-field
        v-if="VIEW('ac') && value.ac && value.ac.length > 0"
        :value="value.ac"
        :preprocessor="ac"
        @input="
          (event) => {
            value.ac[event.index].ac = event.value
            handleChange()
          }
        "
        placeholder="?"
        label="AC"
        class="mt-2"
      ></v-array-field>
    </v-list-item-avatar>

    <v-overlay v-if="VIEW('avatar')" :value="avatarOverlay" @click="avatarOverlay = false">
      <div class="d-flex flex-column justify-center align-center">
        <v-img :src="avatar()" @click="avatarOverlay = false" contain style="max-height: 90vh;"></v-img>
        <v-btn @click="avatarOverlay = false" v-shortkey="['esc']" @shortkey="avatarOverlay = false" icon class="mt-2">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-overlay>

    <v-list-item-content class="grid-main">
      <v-list-item-title class="title">
        <div>
          <span>{{ VIEW('name') ? value.name : '??' }}</span>
          <span v-if="VIEW('source')" class="grey--text subtitle-1 font-weight-black ml-3">{{ value.source }}</span>
        </div>
        <div
          v-if="VIEW('type') || VIEW('level') || VIEW('cr')"
          class="caption grey--text text--lighten-1"
          style="margin-top: -6px; overflow: auto;"
        >
          <span v-if="VIEW('type')" class="font-italic">{{ value.__pTypes.asText }}</span>
          <span v-if="VIEW('type') && (VIEW('cr') || VIEW('level'))">&mdash;</span>
          <span v-if="VIEW('cr') || VIEW('level')" class="font-italic">{{ level_or_cr() }}</span>
        </div>
        <div v-if="VIEW('alignment')" class="caption grey--text text--lighten-1" style="margin-top: -3px; overflow: auto;">
          <span class="font-italic">{{ value.__tAlignment }}</span>
        </div>
      </v-list-item-title>
      <v-list-item-subtitle v-if="VIEW('tags') || VIEW('abilities')">
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
            v-if="VIEW('tags.size')"
            :editable="PERMISSIONS.EDIT && EDIT('tags.size')"
            :value="sizes(value.size)"
            :selected="selected_tag === 'size'"
            title="Size"
            label="Size"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.speed')"
            :editable="PERMISSIONS.EDIT && EDIT('tags.speed')"
            :value="value.speed"
            :preprocessor="speed"
            :selected="selected_tag === 'speed'"
            @input="
              (event) => {
                lodashSet(value.speed, [event.item.key, ...event.path], event.value)
                handleChange()
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
            :editable="PERMISSIONS.EDIT && EDIT('tags.saves')"
            :value="saves(value)"
            :selected="selected_tag === 'saves'"
            @input="
              (event) => {
                lodashSet(value.save, [event.item.key, ...event.path], event.value)
                handleChange()
              }
            "
            :source="{
              type: 'object',
              key: ATRIBUTES
            }"
            :template="[
              true,
              {
                ratio: 1.1,
                bonus: 1
              }
            ]"
            title="Saving Throws"
            label="Proficient"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.skills')"
            :editable="PERMISSIONS.EDIT && EDIT('tags.skills')"
            :value="skills(value)"
            :selected="selected_tag === 'skills'"
            @input="
              (event) => {
                lodashSet(value.skill, [event.item.key, ...event.path], event.value)
                handleChange()
              }
            "
            :source="{
              type: 'object',
              key: SKILLS
            }"
            :template="[
              true,
              {
                ratio: 1.1,
                bonus: 1
              }
            ]"
            title="Skills"
            label="Proficient"
          ></v-tags>
          <v-tags
            :editable="PERMISSIONS.EDIT && EDIT('tags.' + immRes.key)"
            v-for="immRes in [
              { key: 'vulnerable', title: 'Vulnerabilities', label: 'Vulnerability' },
              { key: 'resist', title: 'Resistances', label: 'Resistance' },
              { key: 'immune', title: 'Immunities', label: 'Immunity' }
            ].filter((ir_obj) => !!VIEW(`tags.${ir_obj.key}`))"
            :key="immRes.key"
            :value="immunitiesResistances(value[immRes.key])"
            :selected="selected_tag === immRes.key"
            @input="
              (event) => {
                lodashSet(value[immRes.key], [...event.item.key, ...event.path], event.value)
                handleChange()
              }
            "
            :title="`DMG. ${immRes.title}`"
            :label="immRes.label"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.conditionImmune')"
            :editable="PERMISSIONS.EDIT && EDIT('tags.conditionImmune')"
            :value="conditionImmunities(value.conditionImmune)"
            :selected="selected_tag === 'conditionImmune'"
            @input="
              (event) => {
                lodashSet(value.conditionImmune, [event.item.key, ...event.path], event.value)
                handleChange()
              }
            "
            title="Condition Immunities"
            label="Immunity"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags.senses')"
            :editable="PERMISSIONS.EDIT && EDIT('tags.senses')"
            :value="senses(value)"
            :selected="selected_tag === 'senses'"
            @input="
              (event) => {
                if (event.item.key === 'passive') {
                  lodashSet(value.skill, ['perception', ...event.path], event.value)
                } else {
                  lodashSet(value.senses, [event.item.key, ...event.path], event.value)
                }
                handleChange()
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
            :editable="PERMISSIONS.EDIT && EDIT('tags.languages')"
            :value="languages(value.languages)"
            :selected="selected_tag === 'languages'"
            @input="
              (event) => {
                lodashSet(value.languages, [event.item.key, ...event.path], event.value)
                handleChange()
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
            v-for="(casting, casting_index) in [value.spellcasting].flat(1).filter((s) => s !== undefined)"
            :key="casting_index"
            v-if="VIEW('tags.spellcasting')"
            :editable="PERMISSIONS.EDIT && EDIT('tags.spellcasting')"
            :value="spellcasting(casting, value)"
            :selected="selected_tag === 'spellcasting'"
            :title="casting.name"
            label="Spellcasting"
          ></v-tags>
          <v-tags
            v-if="VIEW('tags._conditions')"
            :editable="PERMISSIONS.EDIT && EDIT('tags._conditions')"
            :value="conditions(value._conditions)"
            :selected="selected_tag === '_conditions'"
            @input="
              (event) => {
                lodashSet(value._conditions, [event.item.key, ...event.path], event.value)
                handleChange()
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
      <dnd-hp :value="value._hp" @change="handleChange()" :selected="selected"></dnd-hp>
    </v-list-item-action>

    <v-list-item-action class="align-self-center grid-actions">
      <v-tooltip v-if="VIEW('_rolls') && VIEW('_rolls.initiative') && GLOBAL_VIEW('initiative')" left>
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
        <span>Roll Initiative (I)</span>
      </v-tooltip>

      <v-tooltip v-if="PERMISSIONS.EDIT && EDIT('remove')" left>
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

// eslint-disable-next-line no-unused-vars
import { info } from '../../../utils/debug'
// eslint-disable-next-line no-unused-vars
import VArrayFieldVue from '../../utils/VArrayField/index.vue'
import VTagsVue from '../../utils/VTags.vue'
import { vueSet } from '../../../utils/object'
import { LIST_ABBREVIATIONS } from '../../../utils/system/constants/abilities'
import { LIST_SKILLS } from '../../../utils/system/constants/skills'
import { LIST_CONDITIONS } from '../../../utils/system/constants/conditions'
import { LIST_LANGUAGES } from '../../../utils/system/constants/languages'
import { defaults, nestedValue } from '../../../utils/permissions'
import VCroppingImageVue from '../../utils/VCroppingImage.vue'
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
    'v-tags': VTagsVue,
    'v-cropping-image': VCroppingImageVue
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
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    if (!isValid(this.permissions)) this.permissions = defaults('character')

    return {
      // shortkeys
      selected_tag: undefined,
      focused_initiative: false,
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
    ...mapGetters(['GLOBAL_PERMISSIONS']),
    EDIT() {
      return (path) => {
        if (path === undefined) {
          if (this.permission.edit === undefined) return true
          const nested = nestedValue(this.permission.edit)
          return nested === undefined ? true : nested
        }

        const _nested = nestedValue(_.get(this.permission.edit || {}, path))
        return _nested === undefined ? true : _nested
      }
    },
    VIEW() {
      return (path) => {
        if (path === undefined) {
          if (this.permission.view === undefined) return true
          const nested = nestedValue(this.permission.view)
          return nested === undefined ? true : nested
        }

        const _nested = nestedValue(_.get(this.permission.view || {}, path))
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
    color() {
      const color = this.$props.value._color === undefined ? '#616161' : this.$props.value._color
      return color.hex || color
    },
    tags() {
      const TAGS = [
        {
          key: 'speed',
          size: this.speed(this.value.speed).length
        },
        {
          key: 'saves',
          size: this.saves(this.value).length
        },
        {
          key: 'skills',
          size: this.skills(this.value).length
        },
        {
          key: 'vulnerable',
          size: this.immunitiesResistances(this.value.vulnerable).length
        },
        {
          key: 'resist',
          size: this.immunitiesResistances(this.value.resist).length
        },
        {
          key: 'immune',
          size: this.immunitiesResistances(this.value.immune).length
        },
        {
          key: 'conditionImmune',
          size: this.conditionImmunities(this.value.conditionImmune).length
        },
        {
          key: 'senses',
          size: this.senses(this.value).length
        },
        {
          key: 'languages',
          size: this.languages(this.value.languages).length
        },
        {
          key: '_conditions',
          size: this.conditions(this.value._conditions).length
        }
      ]

      return TAGS.filter((t) => t.size > 0 || (this.PERMISSIONS.EDIT && this.EDIT('tags.' + t.key)))
    }
  },
  watch: {
    selected(newVal, oldVal) {
      if (!newVal && oldVal) {
        if (this.focused_initiative) {
          this.blurInitiative()
        }
        this.selected_tag = undefined
      }
    }
  },
  mounted() {
    // info('Mounted List Item', this.$props.value)
  },
  methods: {
    lodashSet: vueSet,
    modifier,
    hasRolled: CHARACTER.hasRolled,
    ac: CHARACTER.acToArray,
    sizes: CHARACTER.sizeToArray,
    speed: CHARACTER.speedToArray,
    skills: CHARACTER.skillsToArray,
    saves: CHARACTER.savesToArray,
    senses: CHARACTER.sensesToArray,
    languages: CHARACTER.languagesToArray,
    immunitiesResistances: CHARACTER.immunitiesAndResistancesToArray,
    conditionImmunities: CHARACTER.conditionImmunitiesToArray,
    conditions: CHARACTER.conditionsToArray,
    spellcasting: CHARACTER.spellcastingToArray,
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

      // if (images.length > 1) throw new Error('Too many images to decide a avatar')

      if (images.length === 0) return false

      if (images[0].href) {
        if (images[0].href.type === 'custom') {
          return `characters/${images[0].href.path}`
        } else if (images[0].href.type === 'internal') {
          return `img/${images[0].href.path}`
        } else {
          return images[0].href.path
        }
      } else {
        throw new Error('No HREF property in image')
      }
    },
    croppedAvatar() {
      const _images = (this.$props.value._fluff && this.$props.value._fluff.images) || []
      const images = _images.filter((i) => i.type === 'image')

      // if (images.length > 1) throw new Error('Too many images to decide a avatar')

      if (images.length === 0) return undefined

      return images[0].crop || undefined
    },
    level_or_cr() {
      const crLevel = this.$props.value.__fCrLevel
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
      this.handleChange()
    },
    handleColor(event) {
      this.$props.value._color = event
      this.handleChange()
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
      this.handleChange()
    },
    handleChange() {
      this.$emit('change')
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
    },
    focusInitiative() {
      this.$refs['edit-initiative'].focus()
      this.focused_initiative = true
    },
    blurInitiative() {
      this.$refs['edit-initiative'].blur()
      this.focused_initiative = false
    },
    handleArrowRight() {
      const currentIndex = this.selected_tag === undefined ? undefined : this.tags.findIndex((t) => t.key === this.selected_tag)

      const value = (isValid(currentIndex) ? currentIndex : -1) + 1
      const nextIndex = value >= this.tags.length ? 0 : value

      this.selected_tag = this.tags[nextIndex].key
    },
    handleArrowLeft() {
      const currentIndex = this.selected_tag === undefined ? undefined : this.tags.findIndex((t) => t.key === this.selected_tag)

      const value = (isValid(currentIndex) ? currentIndex : +1) - 1
      const nextIndex = value < 0 ? this.tags.length + value : value

      this.selected_tag = this.tags[nextIndex].key
    }
  }
}
</script>

<style lang="sass" scoped>
.view-false
  display: none !important

.zIndex-1000
  z-index: 1000 !important
  opacity: 1 !important

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
