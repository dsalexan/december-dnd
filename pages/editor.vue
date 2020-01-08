<template>
  <div class="page-editor">
    <v-tabs v-model="tab" grow height="60" show-arrows>
      <v-tab v-for="character in characters" :key="character._id">
        <div class="d-flex flex-column">
          <span>{{ character.name }} ({{ character.source }})</span>
          <span class="caption grey--text text--darken-1 font-italic font-weight-medium">
            {{ character._id }}
          </span>
        </div>
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item v-for="(character, id) in characters" :key="id" light>
        <v-btn
          @click="handleSave(id)"
          :disabled="!Object.keys(saveStack).includes(id)"
          color="grey darken-4"
          class="amber--text text--darken-2"
          block
          light
        >
          <v-icon>mdi-check</v-icon> SAVE
        </v-btn>
        <!-- {{ character }} -->
        <v-jsoneditor
          :value="characters[id]"
          @input="debounced_onInput($event, id)"
          :options="{}"
          :plus="false"
          @error="onError($event, id)"
        />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import VJsoneditor from 'v-jsoneditor'
import debug from '../utils/debug'
import { simplify } from '../domain/character'

const error = debug.error.extend('editor')
// const info = debug.info.extend('editor')

export default {
  components: {
    VJsoneditor
  },
  data() {
    return {
      tab: undefined,
      saveStack: {}
    }
  },
  computed: {
    ...mapState('characters', {
      index: 'index'
    }),
    characters() {
      return Object.keys(this.index).reduce(
        (obj, char) => ({
          ...obj,
          [char]: simplify(this.index[char])
        }),
        {}
      )
    }
  },
  created() {
    this.debounced_onInput = _.debounce(
      function(event, character) {
        this.onInput(event, character)
      }.bind(this),
      1000
    )
  },
  methods: {
    ...mapActions('characters', ['update']),
    onError(err, character) {
      error(err, character)
    },
    onInput(event, character) {
      this.$set(this.saveStack, character, event)
    },
    handleSave(character) {
      this.update({ id: character, data: this.saveStack[character] })

      this.$delete(this.saveStack, character)
    }
  }
}
</script>

<style lang="sass" scoped>
.page-editor
  .jsoneditor-container::v-deep
    background: white

    .jsoneditor
      border: thin solid #F9A825

      .jsoneditor-menu
        background-color: #F9A825
        border-bottom: 1px solid #F9A825
</style>
