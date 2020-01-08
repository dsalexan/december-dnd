<template>
  <div :style="`padding-left: ${16 * depth}px`" class="v-nested-switch">
    <template v-if="valueType === 'boolean'">
      <v-switch :input-value="value" :label="label" @change="onChange" color="amber darken-2" hide-details></v-switch>
    </template>
    <template v-else>
      <!-- {{ fields }} -->
      <!-- eslint-disable-next-line max-len -->
      <!-- <v-switch :value="value" :label="label" color="amber darken-2"></v-switch> -->
      <div v-if="depth > 0" class="d-flex flex-row align-center">
        <v-nested-switch
          :value="nestedValue(value) || false"
          :path="path"
          :label="path[path.length - 1].toTitleCase()"
          :depth="depth - 2"
          @change="onParentChange"
        ></v-nested-switch>
        <!-- {{ path[path.length - 1].toTitleCase() }} -->

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="show = !show" small color="amber darken-2" class="mt-5 ml-4" icon hide-details>
              <v-icon small>mdi-chevron-{{ show ? 'up' : 'down' }}</v-icon>
            </v-btn>
          </template>
          <span>{{ show ? 'Hide' : 'Show' }} All</span>
        </v-tooltip>

        <span class="caption">{{ nestedValue(value) === undefined ? '' : `(${nestedValue(value)})` }}</span>
      </div>
      <div :style="`display: ${!show && depth > 0 ? 'none' : ''}`">
        <v-nested-switch
          v-for="(field, index) in fields"
          :key="field.path_string"
          :value="field.value"
          :path="field.path"
          :label="field.label"
          :depth="depth + 1"
          @change="onChildrenChange({ ...$event, index })"
        ></v-nested-switch>
      </div>
    </template>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { getPaths } from '../../utils/object'
import { nestedValue } from '../../utils/permissions'

function makeFields(value, previous_path) {
  return Object.keys(value).map((key) => {
    const path = [...(previous_path || []), key]
    return {
      path_string: path.join('.'),
      label: key.toTitleCase(),
      path,
      value: value[key]
    }
  })
}

export default {
  name: 'v-nested-switch',
  props: {
    value: {
      type: [Object, Boolean],
      default: () => {}
    },
    label: {
      type: String,
      default: undefined
    },
    path: {
      type: [Array],
      default: () => []
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      show: false,
      fields: makeFields(this.value || {}, this.path || [])
    }
  },
  computed: {
    valueType() {
      return typeof this.$props.value
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.fields = makeFields(newVal, this.$props.path)
      },
      deep: true
    },
    path: {
      handler(newVal) {
        this.fields = makeFields(this.$props.value, newVal)
      },
      deep: true
    }
  },
  methods: {
    nestedValue,
    onChange(value) {
      // info('ON CHANGE', this.$props.path, value)
      this.$emit('change', { value: !!value, path: this.$props.path })
    },
    onParentChange(event) {
      // info('ON PARENT CHANGE', this.$props.path, event)

      const paths = getPaths(this.$props.value)
      for (const path of paths) {
        // _.set(this.fields, path, !!value)
        this.$emit('change', { value: !!event.value, path: [...this.$props.path, ...path] })
      }
    },
    onChildrenChange(event) {
      // info('ON CHILDREN CHANGE', this.$props.path, event)
      this.$emit('change', event)
    }
  }
}
</script>

<style lang="sass" scoped>
.v-nested-switch
</style>
