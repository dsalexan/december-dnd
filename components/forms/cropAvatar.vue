<template>
  <div class="d-flex flex-column align-center py-6" style="width: 100%">
    <div>
      <v-avatar size="200" color="grey darken-4">
        <v-img v-if="value && !isCropping && prexistentCrop === undefined" :src="value"></v-img>
        <v-cropping-image
          v-else-if="value || prexistentCrop || cropData"
          :src="value"
          :crop="isCropping ? cropData : prexistentCrop"
        ></v-cropping-image>
        <!-- <v-img v-if="value" :src="cropppedImage || value"></v-img> -->
        <span v-else class="white--text headline d-flex align-center" style="height: 72px">
          &mdash;
        </span>
      </v-avatar>
    </div>
    <!-- {{ stringCropData }} -->
    <div v-if="isCropping && !!value" class="mt-6">
      <SlimCropper
        v-if="value"
        :src="value"
        :cropperOptions="{
          aspectRatio: 1,
          dragMode: 'move',
          crop: function(event) {
            cropData = {
              size: event.detail.width,

              width: event.target.naturalWidth,
              height: event.target.naturalHeight,

              x: event.detail.x,
              y: event.detail.y
            }
            $emit('crop', { data: cropData })
          }
        }"
        style="max-height: 300px"
      ></SlimCropper>
    </div>
    <v-btn
      v-if="!isCropping"
      @click="
        () => {
          isCropping = true
          cropData = undefined
        }
      "
      :disabled="isCropping || value === undefined"
      color="amber darken-2"
      class="mt-3"
      icon
      light
    >
      <template> <v-icon>mdi-crop</v-icon></template>
    </v-btn>
    <v-btn
      v-if="isCropping"
      @click="
        () => {
          isCropping = false
          cropData = undefined
          $emit('cancel')
        }
      "
      color="amber darken-2"
      class="mt-3"
      icon
      light
    >
      <template> <v-icon>mdi-cancel</v-icon></template>
    </v-btn>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import SlimCropper from 'vue-slim-cropper'

import VCroppingImageVue from '../utils/VCroppingImage.vue'

export default {
  components: {
    SlimCropper,
    'v-cropping-image': VCroppingImageVue
  },
  props: {
    value: {
      type: String,
      default: undefined
    },
    prexistentCrop: {
      type: Object,
      default: () => undefined
    }
  },
  data() {
    return {
      isCropping: false,
      cropData: undefined
    }
  }
}
</script>

<style lang="sass" scoped></style>
