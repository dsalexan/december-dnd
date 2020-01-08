<template>
  <div class="v-tag">
    <v-hover v-slot:default="{ hover }">
      <v-chip
        v-if="!!editable && allowEdit"
        @click="dialog = true"
        :color="'black'"
        class="v-btn-chip text-uppercase"
        label
        small
        depressed
        x-small
      >
        <v-icon :color="!hover ? 'grey darken-1' : 'white'" x-small>mdi-pencil</v-icon>
      </v-chip>
    </v-hover>

    <v-chip
      v-if="isValid(computed_label)"
      class="v-btn-chip text-uppercase"
      style="padding-right: 6px"
      color="grey darken-4"
      label
      small
      depressed
      x-small
    >
      <tools-render :value="computed_label" class="font-weight-light font-italic"></tools-render>
    </v-chip>

    <v-chip
      v-if="isValid(computed_value)"
      :style="
        `padding-left: ${isValid(computed_label) ? 6 : 8.8888888889}px; padding-right: ${
          isValid(computed_tooltip) ? 6 : 8.8888888889
        }px`
      "
      class="v-btn-chip text-uppercase"
      color="grey darken-4"
      label
      small
      depressed
      x-small
    >
      <tools-render :class="`font-weight-${weight}`" :value="computed_value"></tools-render>
    </v-chip>

    <v-tooltip v-if="isValid(computed_tooltip)" bottom>
      <template v-slot:activator="{ on }">
        <v-chip
          v-on="on"
          class="v-btn-chip text-uppercase"
          style="padding: 0 6px"
          color="grey darken-4"
          label
          small
          depressed
          x-small
        >
          <span class="font-weight-bold">*</span>
        </v-chip>
      </template>
      <span><tools-render :value="computed_tooltip"></tools-render></span>
    </v-tooltip>

    <v-hover v-slot:default="{ hover }" v-if="removable">
      <v-chip
        v-if="!!editable && allowEdit"
        @click="removeTag"
        :color="'black'"
        class="v-btn-chip text-uppercase"
        label
        small
        depressed
        x-small
      >
        <v-icon :color="!hover ? 'red darken-4' : 'white'" x-small>mdi-minus</v-icon>
      </v-chip>
    </v-hover>

    <v-dialog v-if="allowEdit" v-model="dialog" max-width="500">
      <v-card class="v-tag__dialog">
        <v-card-title class="headline" style="padding-bottom: 0px">
          <template v-if="!isValid(computed_label)">{{ title }}</template>
          <template v-else>
            <span class="font-weight-light mr-1">{{ title }} —</span>
            <tools-render
              :value="computed_label"
              :textPostProcess="(s) => s.toTitleCase()"
              class="font-weight-light font-italic"
            ></tools-render>
          </template>
        </v-card-title>
        <v-card-text class="d-flex flex-column justify-center">
          <div class="subtitle-1 mb-4">
            <tools-render v-if="isValid(computed_tooltip)" :value="computed_tooltip"></tools-render>
          </div>
          {{ template }}
          <v-tabs v-model="tab" dark grow dense height="35" color="amber darken-2" show-arrows>
            <v-tab v-if="editable && editable.value" href="#tab-value">Value</v-tab>
            <v-tab v-for="(t, index) in template" :key="index" :href="`#tab-template${index}`">Template {{ index }}</v-tab>

            <v-tab-item v-for="(ftab, tIndex) in form_tabs" :key="tIndex" :value="`tab-${ftab.name}`" class="mt-2">
              <form-generator :value="ftab.value" :template="ftab.form" :label="label" @input="onInput"></form-generator>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import { isValid } from '../../utils/value'
import renderVue from '../5etools/render.vue'
import generatorVue from '../forms/generator.vue'

export default {
  components: {
    'tools-render': renderVue,
    'form-generator': generatorVue
  },
  props: {
    value: {
      type: Object,
      default: () => ({
        key: undefined,
        label: undefined,
        value: undefined,
        tooltip: undefined,
        display: undefined,
        source: undefined,
        editable: true,
        removable: true
      })
    },
    title: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'Label'
    },
    template: {
      type: Array,
      default: () => []
    },
    allowEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false,
      tab: null
    }
  },
  computed: {
    chip_events() {
      return (on) => {
        return {
          ...(isValid(this.computed_tooltip) ? on : {}),
          ...(!!this.editable && this.allowEdit
            ? {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                click: () => (this.dialog = true)
              }
            : {})
        }
      }
    },
    weight() {
      return this.$props.value.label && this.$props.value.label !== '' ? 'black' : 'medium'
    },
    editable() {
      const shouldnt_edit = this.$props.value.editable === false
      const edit_params = {
        value: !shouldnt_edit,
        template: !shouldnt_edit
      }

      if (_.isObjectLike(this.$props.value.editable)) {
        edit_params.value = edit_params.value && this.$props.value.editable.value !== false
        edit_params.template =
          edit_params.template &&
          this.$props.value.editable.template !== false &&
          this.$props.template &&
          this.$props.template.length > 0
      }

      return !edit_params.value && !edit_params.template ? false : edit_params
    },
    removable() {
      return isValid(this.$props.value.removable) ? this.$props.value.removable : true
    },
    computed_display() {
      return this.$props.value.display || {}
    },
    computed_label() {
      if (this.computed_display.label && _.isFunction(this.computed_display.label))
        return this.computed_display.label(this.$props.value.label)

      return this.computed_display.label === undefined ? this.$props.value.label : this.computed_display.label
    },
    computed_value() {
      if (this.computed_display.value && _.isFunction(this.computed_display.value))
        return this.computed_display.value(this.$props.value.value)

      return this.computed_display.value === undefined ? this.$props.value.value : this.computed_display.value
    },
    computed_tooltip() {
      if (this.computed_display.tooltip && _.isFunction(this.computed_display.tooltip))
        return this.computed_display.tooltip(this.$props.value.tooltip)

      return this.computed_display.tooltip === undefined ? this.$props.value.tooltip : this.computed_display.tooltip
    },
    computed_template() {
      return this.editable && this.editable.template ? this.$props.template : []
    },
    form_tabs() {
      return [
        {
          name: 'value',
          template: this.$props.value.source || this.$props.value.value,
          value: this.$props.value.source || this.$props.value.value
        },
        ...this.computed_template.map((t, index) => ({
          name: `template${index}`,
          form: t
        }))
      ]
    }
  },
  methods: {
    isValid(value) {
      return isValid(value) && value !== ''
    },
    onInput(event) {
      this.$emit('input', event)
    },
    removeTag() {
      this.$emit('input', { path: [], value: undefined })
    }
  }
}
</script>

<style lang="sass" scoped>
.v-tag
  display: inline-flex

  .v-btn-chip::v-deep
    height: 20px
    padding: 0 8.8888888889px
    font-size: 0.625rem
    letter-spacing: 0.0892857143em

  > .v-chip::v-deep
    &.v-chip--label
      border-radius: 0px !important

      &:first-of-type
        border-top-left-radius: 4px !important
        border-bottom-left-radius: 4px !important

      &:last-of-type
        border-top-right-radius: 4px !important
        border-bottom-right-radius: 4px !important
</style>

<style lang="sass">
.v-tag__dialog
  .v-text-field

    &.boldable
      input
        font-weight: 500
</style>
