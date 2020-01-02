<template>
  <div :class="{ hidden: !visible && !editable }" class="v-tags d-inline-flex flex-row align-center flex-wrap">
    <div class="v-btn-group mr-2">
      <v-btn @click="show = !show" :color="!highlight ? 'grey darken-2' : 'grey lighten-2'" light depressed x-small class="mb-2">
        <span class="text-uppercase overline font-weight-medium" style="letter-spacing: 0.0892857143em !important;">{{
          title
        }}</span></v-btn
      >

      <v-hover v-slot:default="{ hover }">
        <v-btn
          @click="dialog = true"
          v-if="!highlight && editable && array_template.length > 0 && isValid(source)"
          :color="!hover ? 'grey darken-2' : 'black'"
          depressed
          x-small
          class="mb-2"
          style="min-width: 20px"
        >
          <v-icon :color="!hover ? 'grey' : 'white'" small>mdi-plus</v-icon>
        </v-btn>
      </v-hover>
    </div>
    <v-tag
      v-for="(item, index) in preprocessed_value"
      :key="index"
      :value="item"
      @input="({ value, path }) => onInput(path, value, item)"
      @remove="onRemove(item)"
      :title="title"
      :label="label"
      :template="item.template || template"
      :allowEdit="editable"
      class="mr-2 mb-2"
    >
    </v-tag>

    <v-dialog v-if="editable && isValid(source)" v-model="dialog" max-width="350">
      <v-card>
        <v-card-title class="headline">Add {{ title }}</v-card-title>
        <v-card-text>
          ADD KEY {{ addKey }} //
          <v-text-field
            v-if="custom_source_key"
            v-model="addKey"
            hide-details
            label="Key"
            color="amber darken-1"
            class="mb-2 boldable"
            filled
            dense
            dark
          ></v-text-field>
          <div v-if="computed_source_key">
            {{ source.key }}
            <v-select v-model="addKey" :items="computed_source_key" filled label="Key" hide-details></v-select>
          </div>
          <v-tabs v-model="tab" @change="addModel = undefined" dark grow dense height="35" color="amber darken-2" show-arrows>
            <v-tab v-for="(t, index) in array_template" :key="index" :href="`#tab-template${index}`">Template {{ index }}</v-tab>

            <v-tab-item v-for="(t, tIndex) in array_template" :key="tIndex" :value="`tab-template${tIndex}`" class="mt-2">
              <form-generator
                :value="addModel"
                :template="array_template[tIndex]"
                :label="label"
                @input="onAddInput"
              ></form-generator>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="submitAddDialog" color="green darken-1" text>Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

import generatorVue from '../forms/generator.vue'
import { isValid } from '../../utils/value'
import { vueSet } from '../../utils/object'
import VTagVue from './VTag.vue'

export default {
  components: {
    'v-tag': VTagVue,
    'form-generator': generatorVue
  },
  props: {
    value: {
      type: [Array, Object],
      default: () => []
    },
    preprocessor: {
      type: Function,
      default: (obj) => obj
    },
    label: {
      type: String,
      default: 'Label'
    },
    title: {
      type: String,
      default: 'Title'
    },
    template: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: false
    },
    source: {
      type: Object,
      default: () => undefined
    }
  },
  data() {
    return {
      show: false,
      dialog: false,
      tab: null,
      addModel: undefined,
      addKey: _.isArray((this.source || {}).key) ? (this.source || {}).key[0] : (this.source || {}).key
    }
  },
  computed: {
    preprocessed_value() {
      return this.show ? this.$props.preprocessor(this.$props.value) : []
    },
    highlight() {
      return !this.show && this.$props.value && (this.$props.value.length > 0 || Object.keys(this.$props.value).length > 0)
    },
    visible() {
      return this.$props.value && (this.$props.value.length > 0 || Object.keys(this.$props.value).length > 0)
    },
    custom_source_key() {
      const custom = this.$props.source && this.$props.source.type === 'object' && this.$props.source.custom
      const no_key = this.$props.source && this.$props.source.type === 'object' && !isValid(this.$props.source.key)
      return custom || no_key
    },
    computed_source_key() {
      if (this.$props.source) {
        if (isValid(this.$props.source.key)) {
          return _.isArray(this.$props.source.key) ? this.$props.source.key : [this.$props.source.key]
        }
      }

      return undefined
    },
    array_template() {
      if (!isValid(this.$props.template)) return []
      const template = _.isArray(this.$props.template) ? this.$props.template : [this.$props.template]

      return template
    }
  },
  methods: {
    isValid,
    onInput(path, value, item) {
      this.$emit('input', { path, value, item })
      // console.log('ON INPUT', path, value, item)
    },
    onRemove(item) {
      // this.$emit('input', { path: [], value: undefined, item })
      console.log('ON REMOVE', item)
    },
    onAddInput({ path = [], value, item }) {
      vueSet(this, ['addModel', ...path], value)
      // console.log('ON ADD INPUT', path, value, item, 'RESULT', this.addModel)
    },
    submitAddDialog() {
      this.dialog = false

      this.onInput([], this.addModel, {
        key: isValid(this.addKey) ? this.addKey : this.$props.source.key
      })

      this.addModel = undefined
      this.addKey = undefined
    }
  }
}
</script>

<style lang="sass" scoped>
.v-tags
  &.hidden
    display: none !important

  .v-btn-group
    display: inline-flex
    .v-btn::v-deep
      border-radius: 0px !important

      &:first-of-type
        border-top-left-radius: 4px !important
        border-bottom-left-radius: 4px !important

      &:last-of-type
        border-top-right-radius: 4px !important
        border-bottom-right-radius: 4px !important
</style>
