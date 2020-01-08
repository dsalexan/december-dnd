<template>
  <div :class="{ show: showMax }" class="dnd-hp">
    <div v-if="selected" class="shortkey-buttons flex-column">
      <v-btn v-shortkey="['-']" @shortkey="handleDamage" @click="handleDamage" small icon color="amber">
        <v-icon small>mdi-minus</v-icon>
      </v-btn>
      <v-btn v-shortkey="['+']" @shortkey="handleHeal" @click="handleHeal" small icon color="amber">
        <v-icon small>mdi-plus</v-icon>
      </v-btn>
      <v-btn v-shortkey="['h']" @shortkey="focusCurrentHP" @click="focusCurrentHP" small icon color="amber">
        <v-icon small>mdi-heart</v-icon>
      </v-btn>
      <v-btn v-shortkey="['m']" @shortkey="focusMaximumHP" @click="focusMaximumHP" small icon color="amber">
        <v-icon small>mdi-heart-multiple</v-icon>
      </v-btn>
    </div>
    <div v-if="showMax || !!value.temporary" :class="{ highlight: !!value.temporary }" class="temporary mr-2">
      <v-text-field
        v-show="showTemp"
        :value="value.temporary"
        @input="debounced_onInput($event, 'temporary')"
        @keyup="onKeyUp($event, 'temporary')"
        placeholder="?"
        solo
        dense
      ></v-text-field>
      <v-btn
        @click="showTemp = !showTemp"
        :text="!value.temporary"
        light
        x-small
        depressed
        class="overline mt-2 grey--text"
        style="font-size: 0.6rem !important; letter-spacing: 0.5px !important;"
      >
        Temp
      </v-btn>

      <div v-show="showTemp" class="v-btn-group mt-2" style="width: 100%">
        <v-btn @click="callDialog('temporary hp', 1, value.temporary)" x-small color="grey darken-3" depressed class="overline">
          <v-icon x-small color="green">mdi-plus</v-icon>
        </v-btn>
        <v-btn @click="callDialog('temporary hp', -1, value.temporary)" x-small color="grey darken-3" depressed class="overline">
          <v-icon x-small color="red">mdi-minus</v-icon>
        </v-btn>
      </div>
    </div>
    <div :style="showMax ? '' : 'margin-bottom: 28px;'" class="current">
      <div class="inputs mb-2">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-text-field
              ref="current-hp"
              :value="value.current"
              @input="debounced_onInput($event, 'current')"
              @keyup="onKeyUp($event, 'current')"
              @focus="focused_current_hp = true"
              @blur="focused_current_hp = false"
              v-on="on"
              placeholder="?"
              solo
              dense
            ></v-text-field>
          </template>
          <span>Current HP (H)</span>
        </v-tooltip>

        <template v-if="showMax">
          <div class="bar">/</div>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-text-field
                ref="maximum-hp"
                :value="value.total"
                @input="debounced_onInput($event, 'total')"
                @keyup="onKeyUp($event, 'total')"
                @focus="focused_maximum_hp = true"
                @blur="focused_maximum_hp = false"
                v-on="on"
                class="total"
                placeholder="?"
                solo
                dense
              ></v-text-field>
            </template>
            <span>Maximum HP (M)</span>
          </v-tooltip>
        </template>
      </div>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            @click="showMax = !showMax"
            v-on="on"
            :style="gradientHp"
            light
            x-small
            depressed
            class="overline grey--text text--darken-4 flex-grow-1"
            style="width: 100%"
          >
            {{ showMax ? 'Hit Points' : 'HP' }}
          </v-btn>
        </template>
        <span>Show More (M)</span>
      </v-tooltip>

      <div v-if="showMax" class="v-btn-group mt-2" style="width: 100%">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              @click="callDialog('current hp', 1, value.current)"
              x-small
              color="grey darken-3"
              depressed
              class="overline"
            >
              <v-icon x-small color="green">mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>Heal (+)</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              @click="callDialog('current hp', -1, value.current)"
              x-small
              color="grey darken-3"
              depressed
              class="overline"
            >
              <v-icon x-small color="red">mdi-minus</v-icon>
            </v-btn>
          </template>
          <span>Deal Damage (-)</span>
        </v-tooltip>
      </div>
    </div>
    <div v-if="showDeathSavingThrows && (showMax || !hideDeathSaves)" class="death-saving-throws ml-2">
      <!-- showDeathSavingThrows -->
      <div v-if="!hideDeathSaves">
        <v-btn
          v-for="(save, index) in objectDeathSaves"
          :key="index"
          @click="toogleDeathSave(index)"
          :color="save.color"
          fab
          x-small
          depressed
          class="xx-small"
        >
          <v-icon :class="save.class">mdi-{{ save.icon }}</v-icon>
        </v-btn>
      </div>

      <div :class="{ 'mt-2': !hideDeathSaves }" class="d-flex flex-row">
        <v-btn
          v-if="!hideDeathSaves"
          @click="resetDeathSaves()"
          dark
          x-small
          depressed
          class="overline grey--text text--lighten-2 flex-grow-1"
        >
          Death Saves
        </v-btn>
        <v-btn
          @click="hideDeathSaves = !hideDeathSaves"
          :style="
            !hideDeathSaves
              ? `padding: 0 2px !important; min-width: 24px !important;`
              : `padding: 0 6px !important; min-width: 32px !important;`
          "
          :x-small="!hideDeathSaves"
          :small="hideDeathSaves"
          dark
          depressed
          class="overline grey--text text--lighten-2 flex-grow-0"
        >
          <v-icon x-small>mdi-{{ hideDeathSaves ? 'skull' : 'close' }}</v-icon>
        </v-btn>
      </div>
    </div>

    <v-dialog v-model="dialog" @click:outside="cancelDialog()" max-width="350">
      <v-card>
        <v-card-title class="headline">
          {{ dialogSignal > 0 ? 'Heal' : 'Damage' }} {{ (dialogTitle || '').toTitleCase() }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            ref="dialogInput"
            :label="(dialogSignal > 0 ? 'heal' : 'damage').toTitleCase()"
            @keydown.enter="submitDialog"
            v-model="dialogValue"
            type="number"
            filled
            color="amber darken-2"
            hide-details
          ></v-text-field>

          <v-sheet class="d-flex flex-row justify-center mt-3 grey--text text--lighten-1 subtitle-1">
            {{ dialogCurrent || 0 }} {{ dialogSignal > 0 ? '+' : '-' }}
            <span :class="`mx-1 font-weight-black ${dialogSignal > 0 ? 'green' : 'red'}--text`">{{ dialogValue || 0 }}</span> =
            <span class="mx-1 font-weight-black white--text">{{ dialogTotal }}</span>
          </v-sheet>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-if="dialog"
                v-shortkey="['esc']"
                @shortkey="cancelDialog"
                @click="cancelDialog()"
                v-on="on"
                small
                color="red darken-1"
                text
              >
                Cancel
              </v-btn>
            </template>
            <span>ESC</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn @click="submitDialog()" v-on="on" small color="green darken-1" text>Confirm</v-btn>
            </template>
            <span>Enter</span>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import Rainbow from 'rainbowvis.js'
import Color from 'color'
import { isValid, int } from '../../../utils/value'

const DEATH_SAVING_THROWS = {
  UNKNOWN: false,
  SUCCESS: 'sucess',
  FAILURE: 'failure'
}

DEATH_SAVING_THROWS.PROGRESSION = {
  [DEATH_SAVING_THROWS.UNKNOWN]: DEATH_SAVING_THROWS.SUCCESS,
  [DEATH_SAVING_THROWS.SUCCESS]: DEATH_SAVING_THROWS.FAILURE,
  [DEATH_SAVING_THROWS.FAILURE]: DEATH_SAVING_THROWS.UNKNOWN
}

function makeHPHeatmap(total) {
  const rainbow = new Rainbow()
  rainbow.setSpectrum('#F44336', '#FFC107', '#4CAF50')
  rainbow.setNumberRange(0, total)

  return rainbow
}

export default {
  props: {
    value: {
      type: Object,
      default: () => ({
        total: 100,
        current: 0,
        temporary: 0,
        death_saving_throw: [
          DEATH_SAVING_THROWS.UNKNOWN,
          DEATH_SAVING_THROWS.UNKNOWN,
          DEATH_SAVING_THROWS.UNKNOWN,
          DEATH_SAVING_THROWS.UNKNOWN,
          DEATH_SAVING_THROWS.UNKNOWN
        ]
      })
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // shortkey
      focused_current_hp: false,
      focused_maximum_hp: false,
      // others
      showTemp: !!this.value.temporary,
      showMax: false,
      hideDeathSaves: false,
      // math
      dialog: false,
      dialogTitle: undefined,
      dialogSignal: undefined,
      dialogValue: undefined,
      dialogCurrent: undefined
    }
  },
  computed: {
    dialogTotal() {
      return (this.dialogSignal || 0) * int(this.dialogValue || 0) + int(this.dialogCurrent || 0)
    },
    showDeathSavingThrows() {
      return this.value.current <= 0
    },
    gradientHp() {
      if ((!isValid(this.$props.value.total) && !isValid(this.$props.value.current)) || !isValid(this.$props.value.current)) {
        return `background: rgba(189,189,189,1);`
      }

      if (this.$props.value.total < this.$props.value.current) {
        return `background: #03A9F4;`
      }

      const hm = makeHPHeatmap(this.$props.value.total)
      const color = hm.colourAt(this.$props.value.current)

      const rgb = Color('#' + color)
        .rgb()
        .array()

      const perc = (this.$props.value.current / this.$props.value.total) * 100

      return `background: linear-gradient(90deg, rgba(${rgb},1) ${perc}%, rgba(189,189,189,1) ${perc}%);`
    },
    objectDeathSaves() {
      return this.$props.value.death_saving_throw.map((save) => {
        let icon = 'minus'
        let css = 'grey--text text--darken-1'
        let color = 'grey darken-2'

        if (save === DEATH_SAVING_THROWS.SUCCESS) {
          icon = 'check'
          css = ''
          color = 'green'
        } else if (save === DEATH_SAVING_THROWS.FAILURE) {
          icon = 'close'
          css = ''
          color = 'red'
        }

        return {
          value: save,
          icon,
          class: css,
          color
        }
      })
    }
  },
  watch: {
    selected(newVal, oldVal) {
      if (!newVal && oldVal) {
        if (this.focused_current_hp) {
          this.blurCurrentHP()
        }

        if (this.focused_maximum_hp) {
          this.blurMaximumHP()
        }
      }
    }
  },
  created() {
    this.debounced_onInput = _.debounce(
      function(event, key = 'current') {
        this.onInput(event, key)
      }.bind(this),
      300
    )
  },
  methods: {
    callDialog(model, signal, current) {
      this.dialog = true

      this.dialogCurrent = current
      this.dialogSignal = signal
      this.dialogTitle = model

      setTimeout(() => {
        this.$refs.dialogInput.$refs.input.focus()
      }, 100)
    },
    cancelDialog() {
      this.dialog = false
      this.dialogSignal = undefined
      this.dialogTitle = undefined
      this.dialogValue = undefined
      this.dialogCurrent = undefined
    },
    submitDialog() {
      const key = this.dialogTitle.replace(' hp', '')

      this.onInput(this.dialogTotal, key)

      this.cancelDialog()
    },
    // EVENTS
    toogleDeathSave(index) {
      this.$set(
        this.$props.value.death_saving_throw,
        index,
        DEATH_SAVING_THROWS.PROGRESSION[this.$props.value.death_saving_throw[index]]
      )
      this.handleChange()
    },
    resetDeathSaves() {
      for (let i = 0; i < 5; i++) {
        this.$set(this.$props.value.death_saving_throw, i, DEATH_SAVING_THROWS.UNKNOWN)
      }
      this.handleChange()
    },
    onInput(event, key = 'current') {
      if (key === 'current') {
        if (!isValid(this.$props.value.total)) this.$set(this.$props.value, 'total', int(event, undefined))
      }
      this.$set(this.$props.value, key, int(event, undefined))
      this.handleChange()
    },
    onKeyUp(event, key = 'current') {
      const add = event.code === 'ArrowUp' ? +1 : event.code === 'ArrowDown' ? -1 : undefined

      if (add === undefined) return

      // info('ON KEY UP', key, add)
      this.$set(this.$props.value, key, this.$props.value[key] + add * 10 ** +!!event.shiftKey)
      // this.$emit('input', {
      //   add
      // })
      this.handleChange()
    },
    handleChange() {
      this.$emit('change')
    },
    handleDamage() {
      this.callDialog('current hp', -1, this.$props.value.current)
    },
    handleHeal() {
      this.callDialog('current hp', 1, this.$props.value.current)
    },
    focusCurrentHP() {
      this.$refs['current-hp'].$refs.input.focus()
      this.focused_current_hp = true
    },
    blurCurrentHP() {
      this.$refs['current-hp'].$refs.input.blur()
      this.focused_current_hp = false
    },
    focusMaximumHP() {
      if (this.showMax === false) this.showMax = true
      else if (this.focused_maximum_hp) this.showMax = false

      setTimeout(() => {
        if (this.showMax) {
          this.$refs['maximum-hp'].$refs.input.focus()
          this.focused_maximum_hp = true
        } else {
          this.focusCurrentHP()
        }
      }, 200)
    },
    blurMaximumHP() {
      if (this.$refs['maximum-hp']) {
        this.$refs['maximum-hp'].$refs.input.blur()
        this.focused_maximum_hp = false
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.dnd-hp
  display: flex
  flex-direction: row
  justify-content: center
  align-items: center

  .temporary, .current
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center

    .v-text-field::v-deep
      input
        width: 22px
        text-align: center
        color: #9E9E9E

      .v-input__slot
        box-shadow: none

      .v-text-field__details
        display: none

    &.highlight
      .v-text-field::v-deep
        .v-input__slot
          background: #616161

        input
          color: #eee !important

      .v-btn::v-deep
        span
          color: #333 !important
          font-weight: 600 !important

  .current
    .inputs
      display: flex
      flex-direction: row
      align-items: center

      .bar
        margin: 0 4px
        color: #BDBDBD

    .v-text-field::v-deep
      input
        width: 30px

      &.total
        .v-input__slot
          padding: 0 6px

        input
          width: 36px

      &:not(.total)
        .v-input__slot
          background: #616161

        input
          color: #eee !important

    .v-btn
      font-size: 0.6rem !important
      letter-spacing: 0.5px !important
      // width: 100%
      flex-grow: 1


  .slider
    .v-input::v-deep
      .v-slider
        min-height: 100px !important
        height: 100px !important

  .death-saving-throws
    margin-bottom: 28px
    > div:first-of-type
      padding: 5px 0

    .v-btn::v-deep
      margin: 0 2px

      &:first-of-type
        margin-left: 0

      &:last-of-type
        margin-right: 0

      &.xx-small
        height: 28px
        min-width: 28px

        .v-icon
          height: 16px
          font-size: 16px
          min-width: 16px

  .v-btn-group
    display: flex
    flex-direction: row

    > .v-btn::v-deep
      border-radius: 0 !important

      &:first-of-type
        border-top-left-radius: 4px !important
        border-bottom-left-radius: 4px !important

      &:last-of-type
        border-top-right-radius: 4px !important
        border-bottom-right-radius: 4px !important


  @media (max-width: 600px)
    &
      width: 100%
      display: flex
      flex-direction: row
      justify-content: center
      align-items: center

      .current
        flex: 1 1

        .inputs
          width: 100%

      &:not(.show)
        .current
          .inputs
            display: none !important
</style>
