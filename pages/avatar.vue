<template>
  <div class="page-images">
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
      <v-tab-item v-for="character in characters" :key="character._id" light>
        <v-btn
          @click="handleSave(character._id)"
          :disabled="!Object.keys(saveStack).includes(character._id)"
          color="grey darken-4"
          class="amber--text text--darken-2"
          block
          light
        >
          <template> <v-icon>mdi-check</v-icon> SAVE </template>
        </v-btn>
        <!-- {{ character }} -->
        <!-- {{ saveStack }} -->
        <crop-avatar
          :value="avatar(character)"
          :prexistentCrop="croppedAvatar(character)"
          @crop="debounced_onInput($event, character._id)"
          @cancel="onCancel(character._id)"
        ></crop-avatar>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import SlimCropper from 'vue-slim-cropper'

// eslint-disable-next-line no-unused-vars
import debug from '../utils/debug'
import { sort } from '../utils/sort'
import cropAvatarVue from '../components/forms/cropAvatar.vue'

const info = debug.info.extend('avatar')

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    SlimCropper,
    'crop-avatar': cropAvatarVue
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
      return Object.values(this.index).sort((a, b) => sort(a.name, b.name))
    },
    avatar() {
      return (character) => {
        const _images = (character._fluff && character._fluff.images) || []
        const images = _images.filter((i) => i.type === 'image')

        // if (images.length > 1) throw new Error('Too many images to decide a avatar')

        if (images.length === 0) return undefined

        if (images[0].href) {
          if (images[0].href.type === 'custom') {
            return `characters/${images[0].href.path || images[0].href.url}`
          } else if (images[0].href.type === 'internal') {
            return `img/${images[0].href.path}`
          } else {
            return images[0].href.url
          }
        } else {
          throw new Error('No HREF property in image')
        }
      }
    },
    croppedAvatar() {
      return (character) => {
        const _images = (character._fluff && character._fluff.images) || []
        const images = _images.filter((i) => i.type === 'image')

        // if (images.length > 1) throw new Error('Too many images to decide a avatar')

        if (images.length === 0) return undefined

        return images[0].crop || undefined
      }
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
    log: info,
    ...mapActions('characters', ['updateImage']),
    onInput(event, character) {
      this.$set(this.saveStack, character, event)
    },
    onCancel(character) {
      this.$delete(this.saveStack, character)
    },
    handleSave(character) {
      // TODO: Implement support for multiple images
      const crop = this.saveStack[character].data

      const image = this.index[character]._fluff.images[0]

      this.updateImage({
        id: character,
        index: 0,
        data: {
          ...image,
          crop
        }
      })

      this.$delete(this.saveStack, character)
    }
  }
}
</script>

<style lang="sass" scoped></style>
