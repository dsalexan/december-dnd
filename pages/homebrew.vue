<template>
  <div class="page-homebrew">
    <div style="width: 100%" class="pa-2 d-flex justify-center">
      <v-btn @click="loadUrl()" color="blue darken-3 mx-2">Load from Url</v-btn>
      <v-btn @click="loadUrl('fendas')" color="yellow darken-3 mx-2">Load Fendas</v-btn>
      <v-btn @click="loadUrl('taldorei')" color="yellow darken-3 mx-2">Load Tal'Dorei</v-btn>
      <v-btn v-if="hasHomebrew" @click="removeAll()" color="red darken-2 mx-2">Remove All</v-btn>
    </div>
    <div style="width: 100%" class="pa-2 d-flex flex-column justify-center align-center">
      <div v-for="source in (homebrewMeta || {}).sources || []" :key="source.json">
        <span class="grey--text font-italic mr-2">{{ source.json }}</span>
        <span style="color: #EEE">{{ source.full }}</span>
        (<span :style="`color: #${source.color}`">
          <b>{{ source.abbreviation }}</b> </span
        >)
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import debug from '../utils/debug'

const error = debug.error.extend('pages:homebrew')

export default {
  computed: {
    ...mapState('tools/brew', ['homebrewMeta']),
    ...mapGetters('tools/brew', ['hasHomebrew'])
  },
  created() {
    this.init()
  },
  methods: {
    ...mapActions('tools/brew', ['remove', 'load', 'init']),
    loadUrl(predefinition) {
      let url
      if (predefinition !== undefined) {
        switch (predefinition) {
          case 'fendas':
            url = 'https://raw.githubusercontent.com/dsalexan/fendas/master/dist/fendas.json'
            break
          case 'taldorei':
            url =
              // eslint-disable-next-line max-len
              'https://raw.githubusercontent.com/TheGiddyLimit/homebrew/master/collection/Matthew%20Mercer%3B%20TalDorei%20Campaign%20Guide.json'
            break
        }
      }

      if (url === undefined) {
        url = prompt('Insert homebrew .json url')

        if (!url) {
          error("Couldn't load url", url)
        }
      }

      this.load({ url })
    },
    removeAll() {
      if (!window.confirm('Are you sure?')) return
      this.remove()
      window.location.hash = ''
      location.reload()
    }
  }
}
</script>

<style lang="sass" scoped>
.page-homebrew
</style>
