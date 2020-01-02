<template>
  <div class="v-array-field d-flex flex-column align-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div v-on="preprocessed_value[index].tooltip ? on : {}" class="v-array-field__input d-flex flex-row align-center">
          <div class="v-array-field__label subtitle-2 grey--text text--lighten-1">
            <v-btn text small color="grey lighten-1">{{ label }}</v-btn>
          </div>
          <div class="v-array-field__slot">
            <item
              :value="preprocessed_value[index].value"
              @input="debounced_onInput"
              :placeholder="placeholder"
              :highlight="highlight"
            />
          </div>
        </div>
      </template>
      <tools-render :value="preprocessed_value[index].tooltip" :join="RENDER.BREAKLINE"></tools-render>
    </v-tooltip>
    <div v-if="preprocessed_value.length > 1" class="v-array-field__control mt-1 d-flex flex-row">
      <v-btn v-if="index < preprocessed_value.length - 1" @click="index++" x-small color="transparent" depressed block tile>
        <v-icon small>mdi-chevron-down</v-icon></v-btn
      >
      <v-btn v-if="index > 0" @click="index--" x-small color="transparent" depressed tile>
        <v-icon small>mdi-chevron-up</v-icon></v-btn
      >
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

import renderVue from '../../5etools/render.vue'
import RENDER from '../../../services/renderer/constants'
import itemVue from './item.vue'

export default {
  components: {
    item: itemVue,
    'tools-render': renderVue
  },
  props: {
    value: {
      type: Array,
      default: () => [
        {
          value: undefined,
          tooltip: undefined
        }
      ]
    },
    label: {
      type: String,
      default: 'Label'
    },
    placeholder: {
      type: String,
      default: undefined
    },
    highlight: {
      type: Boolean,
      default: false
    },
    preprocessor: {
      type: Function,
      default: (obj) => obj
    }
  },
  data() {
    return {
      index: 0,
      RENDER
    }
  },
  computed: {
    preprocessed_value() {
      return this.$props.preprocessor(this.$props.value)
    }
  },
  created() {
    this.debounced_onInput = _.debounce(
      function(event) {
        this.onInput(event)
      }.bind(this),
      500
    )
  },
  methods: {
    onInput(value) {
      this.$emit('input', { value, index: this.index })
    }
  }
}
</script>

<style lang="sass" scoped>
.v-array-field
  .v-array-field__input
    .v-array-field__label
      .v-btn::v-deep
        padding: 0 6px
        min-width: 38px
    .v-array-field__slot

  .v-array-field__control
    width: 100%

    .v-btn
      display: -webkit-box
      display: flex
      -webkit-box-flex: 1
      flex: 1 0 50%
      min-width: 50% !important
      max-width: 100%
      width: 50%
</style>
