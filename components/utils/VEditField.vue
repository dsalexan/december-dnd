<template>
  <div v-on="inputListeners" class="v-edit-field">
    <v-text-field
      ref="text_field"
      v-show="isEditing"
      :value="mutable_value"
      @input="debounced_onInput"
      :label="label"
      @keydown="onKeydown"
      :color="color"
      hide-details
    ></v-text-field>
    <v-btn v-show="isEditing" :color="color" @click="onConfirmClick" icon small depressed>
      <v-icon small>mdi-check</v-icon>
    </v-btn>
    <span v-show="!isEditing" @click="onClick">{{ addedValue }}</span>
  </div>
</template>

<script>
import _ from 'lodash'

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
    },
    color: {
      type: String,
      default: 'amber darken-1'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isEditing: this.editing,
      mutable_value: this.value
    }
  },
  computed: {
    inputListeners() {
      // const vm = this
      // `Object.assign` mescla objetos para formar um novo objeto
      return Object.assign(
        {},
        // Nós adicionamos todas as escutas do pai
        this.$listeners,
        // Então podemos adicionar escutas personalizadas ou substituir
        // comportamento de algumas escutas.
        {
          // // Isso garante que o componente funcione com o v-model
          // input(event) {
          //   vm.$emit('input', event.target.value)
          // }
        }
      )
    },
    addedValue() {
      if (this.$props.add === null || this.$props.add === undefined) return this.$props.value

      if (isNaN(parseInt(this.$props.value))) {
        return '—'
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
  created() {
    this.debounced_onInput = _.debounce(
      function(event) {
        this.onInput(event)
      }.bind(this),
      1000
    )
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
    },
    onConfirmClick() {
      this.isEditing = false
    },
    focus() {
      this.onClick()
    },
    blur() {
      this.isEditing = false
    }
  }
}
</script>

<style lang="sass" scoped>
.v-edit-field
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center

  .v-text-field::v-deep
    margin-bottom: 3px !important
</style>
