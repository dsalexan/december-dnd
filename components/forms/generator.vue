<template>
  <div class="form-generator">
    <div v-for="(field, index) in fields" :key="index">
      <!-- {{ field }} -->
      <template v-if="field.model === 'input'">
        <v-text-field
          :hide-details="true"
          :value="field.parser(lodashGet(computed_value, ['value', ...field.path]))"
          :type="field.type"
          @input="debounced_onInput(field.path, field.parser($event))"
          :label="field.label || label"
          color="amber darken-1"
          class="mb-2 boldable"
          filled
          dense
          dark
        ></v-text-field>
      </template>
      <template v-else-if="field.model === 'switch'">
        <v-switch
          :input-value="field.parser(lodashGet(computed_value, ['value', ...field.path]))"
          @change="debounced_onInput(field.path, field.parser($event))"
          :label="field.label || label"
          color="amber darken-2"
          class="mb-2"
        ></v-switch>
      </template>
      <template v-else-if="field.model === 'select'">
        <v-select
          :value="field.parser(lodashGet(computed_value, ['value', ...field.path]))"
          @change="debounced_onInput(field.path, field.parser($event))"
          :items="field.items"
          :label="field.label || label"
          filled
          hide-details
          color="amber darken-2"
          class="mb-2"
        ></v-select>
      </template>
      <template v-else-if="field.model === 'array'">
        Separator: <b>;</b>
        <v-text-field
          :hide-details="true"
          :value="field.parser(lodashGet(computed_value, ['value', ...field.path]))"
          @input="debounced_onInput(field.path, field.parser($event))"
          :label="field.label || label"
          type="text"
          color="amber darken-1"
          class="mb-2 boldable"
          filled
          dense
          dark
        ></v-text-field>
      </template>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { int, isValid } from '../../utils/value'

function recursiveForm(obj, label = []) {
  const has_items = obj._items && obj._items.length > 0
  const hasnt_items = !isValid(obj._items) || obj._items.length === 0

  if (obj._type === 'number' || _.isNumber(int(obj, undefined))) {
    const r = []

    if (hasnt_items || obj._custom) {
      r.push({
        model: 'input',
        type: 'number',
        label: label[label.length - 1] ? label[label.length - 1].toTitleCase() : label[label.length - 1],
        path: label,
        parser: _.isInteger(obj) ? parseInt : parseFloat
      })
    }

    if (has_items) {
      r.push({
        model: 'select',
        items: obj._items,
        label: label[label.length - 1] ? label[label.length - 1].toTitleCase() : label[label.length - 1],
        path: label,
        parser: _.isInteger(obj) ? parseInt : parseFloat
      })
    }

    return r
  } else if (obj._type === 'boolean' || _.isBoolean(obj) || obj === 'true' || obj === 'false') {
    return [
      {
        model: 'switch',
        label: label[label.length],
        path: label,
        parser: (v) => (_.isBoolean(v) ? v : _.isString(v) ? v.toLowerCase() === 'true' : _.isInteger(v) ? v === 1 : false)
      }
    ]
  } else if (obj._type === 'string' || _.isString(obj)) {
    const r = []

    if (hasnt_items || obj._custom) {
      r.push({
        model: 'input',
        type: 'text',
        label: label[label.length - 1] ? label[label.length - 1].toTitleCase() : label[label.length - 1],
        path: label,
        parser: _.toString
      })
    }

    if (has_items) {
      r.push({
        model: 'select',
        items: obj._items,
        label: label[label.length - 1] ? label[label.length - 1].toTitleCase() : label[label.length - 1],
        path: label,
        parser: _.toString
      })
    }

    return r
  } else if (obj._type === 'array' || _.isArray(obj)) {
    let items_model = _.uniq(obj.map((item) => typeof item))
    if (items_model.length > 1) {
      if (items_model.includes('string')) items_model = ['string']
      else if (items_model.includes('number')) items_model = ['number']
      else items_model = ['string']
    }
    items_model = items_model[0]

    const parser =
      items_model === 'string'
        ? _.toString
        : items_model === 'number'
        ? _.toNumber
        : items_model === 'boolean'
        ? (v) => !!v
        : undefined
    return [
      {
        model: 'array', // 'input',
        type:
          items_model === 'text'
            ? _.toString
            : items_model === 'number'
            ? _.toNumber
            : items_model === 'boolean'
            ? (v) => !!v
            : undefined,
        label: label[label.length - 1] ? label[label.length - 1].toTitleCase() : label[label.length - 1],
        path: label,
        parser: (v) => {
          return isValid(v) ? v.split(';').map((substr) => parser(substr.trim())) : undefined
        }
      }
    ]
  } else if (_.isObjectLike(obj)) {
    return Object.keys(obj).map((key) => {
      return recursiveForm(obj[key], [...label, key])
    })
  } else {
    return []
  }
}

export default {
  props: {
    value: {
      type: [Object, Array, String, Number, Boolean, Date],
      default: () => undefined
    },
    template: {
      type: [Object, Array, String, Number, Boolean, Date],
      default: () => undefined
    },
    label: {
      type: String,
      default: 'Label'
    },
    live: {
      type: Boolean,
      default: true
    }
  },
  // data() {
  //   return {
  //     fields: isValid(this.value) ? recursiveForm(this.value).flat(Infinity) : []
  //   }
  // },
  computed: {
    computed_value() {
      return {
        value: this.$props.value
      }
    },
    fields() {
      if (isValid(this.$props.template)) {
        return recursiveForm(this.$props.template).flat(Infinity)
      }

      return isValid(this.$props.value) ? recursiveForm(this.$props.value).flat(Infinity) : []
    }
  },
  // watch: {
  //   value: {
  //     handler(newVal, oldVal) {
  //       this.fields = isValid(newVal) ? recursiveForm(newVal).flat(Infinity) : []
  //     },
  //     deep: true
  //   }
  // },
  created() {
    this.debounced_onInput = _.debounce(
      function(path, event) {
        this.onInput(path, event)
      }.bind(this),
      500
    )
  },
  methods: {
    lodashGet: _.get,
    onInput(path, value) {
      // info('ON INPUT', path, value)
      this.$emit('input', { value, path })
    }
  }
}
</script>

<style lang="sass" scoped>
.form-generator
  .array-wrapper
    display: grid
    grid-template-columns: 50px auto
    grid-template-rows: auto
    grid-template-areas: "left right"

    .left
      grid-area: left
      display: flex
      flex-direction: row
      justify-content: center
      align-items: center

    .right
      grid-area: right
</style>
