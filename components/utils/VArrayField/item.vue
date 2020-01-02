<template>
  <div :class="{ highlight: highlight || focused }" class="v-field-array__item">
    <v-text-field
      :value="value"
      @input="onInput"
      :placeholder="placeholder"
      @focus="onFocus"
      @blur="onBlur"
      solo
      dense
      small
    ></v-text-field>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [Number, String],
      default: undefined
    },
    placeholder: {
      type: String,
      default: undefined
    },
    highlight: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      focused: false
    }
  },
  methods: {
    onFocus(event) {
      this.focused = true
    },
    onBlur(event) {
      this.focused = false
    },
    onInput(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="sass" scoped>
.v-field-array__item
  .v-text-field::v-deep
    .v-input__control
      min-height: 28px

      .v-input__slot
        box-shadow: none !important
        background: transparent
        padding: 0 8px
        margin-bottom: 0

        input
          width: 22px
          text-align: center
          color: #FAFAFA
          padding-top: 0px
          padding-bottom: 0px

      .v-text-field__details
        display: none

  &.highlight
    .v-text-field::v-deep
      .v-input__control
        .v-input__slot
          background: #616161
</style>
