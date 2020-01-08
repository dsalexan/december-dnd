<template>
  <div class="pusher">
    {{ messages }}
  </div>
</template>

<script>
import Pusher from 'pusher-js'

export default {
  data() {
    return {
      messages: []
    }
  },
  created() {
    this.subcribe()
  },
  methods: {
    subcribe() {
      const pusher = new Pusher('605e2e08d813deb91748', {
        cluster: 'us2'
      })
      pusher.subscribe('december')
      pusher.bind('user:added', (data) => {
        this.messages.push({
          timestamp: new Date(),
          data
        })
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.pusher
</style>
