<template>
  <v-img :src="cropped" class="v-cropping-image"><slot></slot></v-img>
</template>

<script>
/* eslint-disable nuxt/no-globals-in-created */
/* eslint-disable vue/no-async-in-computed-properties */

import _ from 'lodash'

export default {
  props: {
    src: {
      type: String,
      default: ''
    },
    crop: {
      type: Object,
      default: () => ({
        size: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0
      })
    }
  },
  data() {
    return {
      cropped: undefined
    }
  },
  watch: {
    src(newValue) {
      this.debounced_cropImage(newValue)
    },

    crop: {
      handler(newValue) {
        this.debounced_cropImage(this.$props.src)
      },
      deep: true
    }
  },
  created() {
    this.debounced_cropImage = _.debounce(
      function(src, dontEmit) {
        this.cropImage(src, dontEmit)
      }.bind(this),
      1000
    )
  },
  mounted() {
    if (window.__helper_canvas === undefined) {
      window.__helper_canvas = document.createElement('canvas')
      window.__helper_canvas.style.display = 'none'
      document.body.appendChild(window.__helper_canvas)
    }

    if (this.$props.crop) this.debounced_cropImage(this.$props.src)
  },
  methods: {
    cropImage(src) {
      const canvas = window.__helper_canvas
      const data = this.$props.crop
      const img = new Image()

      if (!data || data.size === 0) return

      img.onload = () => {
        canvas.width = data.size
        canvas.height = data.size

        canvas.getContext('2d').drawImage(img, 0, 0, data.width, data.height, -data.x, -data.y, data.width, data.height)
        const base64ImageData = canvas.toDataURL()

        // debugger
        this.cropped = base64ImageData
      }

      img.src = src
    },
    onCrop(event) {
      this.$emit('crop', event)
    }
  }
}
</script>

<style lang="sass" scoped>
.v-cropping-image
</style>
