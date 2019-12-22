<template>
  <div class="v-edit-field">
    <v-text-field
      ref="text_field"
      v-show="isEditing"
      :value="mutable_value"
      @input="onInput"
      :label="label"
      @keydown="onKeydown"
    ></v-text-field>
    <span v-show="!isEditing" @click="onClick">{{ addedValue }}</span>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    add: {
      type: [Number],
      default: null
    },
    editing: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isEditing: this.editing,
      mutable_value: this.value
    }
  },
  computed: {
    addedValue() {
      if (
        this.$props.add === null ||
        this.$props.value === null ||
        isNaN(parseInt(this.$props.value))
      ) {
        return this.$props.value
      } else {
        return parseInt(this.$props.value) + this.$props.add
      }
    }
  },
  watch: {
    value(newValue) {
      this.mutable_value = newValue
    }
  },
  methods: {
    onInput(event) {
      this.$emit('input', event)
    },
    onClick() {
      this.isEditing = true
      setTimeout(
        function() {
          this.$refs.text_field.$refs.input.focus()
        }.bind(this),
        100
      )
    },
    onKeydown(event) {
      if (event.key === 'Enter' || event.key === 'Escape') {
        this.isEditing = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.v-edit-field {
}
</style>
