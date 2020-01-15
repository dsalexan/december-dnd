<template>
  <!-- eslint-disable-next-line vue/require-component-is -->
  <component :is="baseTag">
    <slot></slot>
    <template v-if="isText">
      {{ safe_textPostProcess(value) }}
    </template>
    <template v-else-if="isArray">
      <!-- ARRAY {{ content }} -->
      <tools-render
        v-for="(item, index) in joined_content"
        :textPostProcess="textPostProcess"
        :key="index"
        v-model="joined_content[index]"
      ></tools-render>
    </template>
    <template v-else-if="!isUndefined">
      <template v-if="model === 'component'">
        <!-- eslint-disable-next-line vue/require-component-is -->
        <component :is="value.tag">CONTENT</component>
      </template>
      <template v-if="model === 'link'">
        <a :href="value.href" :target="value.target || '_blank'" :class="`${colorText}`">{{
          safe_textPostProcess(computed_text)
        }}</a>
      </template>
      <template v-else>OBJECT {{ value }}</template>
      <!-- <template></template> -->
    </template>
  </component>
</template>

<script>
import _ from 'lodash'
import { isValid } from '../../utils/value'

export default {
  name: 'tools-render',
  props: {
    value: {
      type: [Array, String, Object, Boolean, Number],
      default: () => undefined
    },
    join: {
      type: [Array, String, Object, Boolean, Number],
      default: () => undefined
    },
    color: {
      type: String,
      default: 'primary'
    },
    textPostProcess: {
      type: Function,
      default: (v) => v
    }
  },
  computed: {
    // STYLE STUFF
    colorText() {
      let [color, shade] = this.$props.color.split(' ')

      color = `${color}--text`
      if (shade !== undefined) shade = ` text--${shade}`
      else shade = ''

      return `${color}${shade}`
    },
    // DATA STUFF
    isUndefined() {
      return !isValid(this.$props.value)
    },
    isText() {
      return _.isString(this.$props.value) || _.isNumber(this.$props.value) || _.isBoolean(this.$props.value)
    },
    isArray() {
      return _.isArray(this.$props.value)
    },
    model() {
      return this.isText ? 'text' : this.$props.value.model
    },
    baseTag() {
      if (this.$props.value === undefined) return 'span'
      if (this.isText) return 'span'
      if (!this.isArray && this.$props.value.tag) return this.$props.value.tag
      // TODO: For arrays, decide baseTag based on arrayChildren types?
      return 'span'
    },
    content() {
      if (!isValid(this.$props.value)) return []
      return this.isArray ? this.$props.value : [this.$props.value]
    },
    joined_content() {
      if (this.$props.join === undefined) return this.content
      return _.zip(
        this.content,
        Array.from(Array(this.content.length)).map(() => this.$props.join)
      )
    },
    computed_text() {
      return this.$props.value.text || this.$props.value.value || this.$props.value
    }
  },
  methods: {
    safe_textPostProcess(value) {
      return this.$props.textPostProcess(value.toString())
    }
  }
}
</script>

<style lang="sass" scoped></style>
