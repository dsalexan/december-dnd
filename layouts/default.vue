<template>
  <v-app
    id="inspire"
    @mousemove.native="handleActive"
    @keydown.native="handleActive"
    @mousedown.native="handleActive"
    @touchstart.native="handleActive"
    class="vuetify-app"
  >
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-list-item v-if="VIEW('pages.tracker')" nuxt to="/tracker">
          <v-list-item-action>
            <v-icon>mdi-speedometer</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Initiative Tracker</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="VIEW('pages.editor')" nuxt to="/editor">
          <v-list-item-action>
            <v-icon>mdi-file-edit</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Character Editor</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="VIEW('pages.avatar')" nuxt to="/avatar">
          <v-list-item-action>
            <v-icon>mdi-account-circle</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Character Avatars</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="VIEW('pages.users')" nuxt to="/users">
          <v-list-item-action>
            <v-icon>mdi-account</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Users</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="VIEW('pages.pusher')" nuxt to="/pusher">
          <v-list-item-action>
            <v-icon>mdi-test-tube</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Pusher</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>December</v-toolbar-title>
      <!-- <span class="ml-4">{{ IDLE ? 'IDLE' : 'ACTIVE' }}, LAST_ACTIVE: {{ LAST_ACTIVE }}</span> -->

      <v-spacer></v-spacer>

      <v-tooltip v-if="VIEW('debug')" left>
        <template v-slot:activator="{ on }">
          <v-btn @click="showStore()" v-on="on" :color="PERMISSIONS.EDIT ? 'amber darken-2' : 'grey'" icon hide-details>
            <v-icon>mdi-bug</v-icon>
          </v-btn>
        </template>
        <span>Debug</span>
      </v-tooltip>
      <v-tooltip v-if="VIEW('edit')" left>
        <template v-slot:activator="{ on }">
          <v-btn @click="toogleEdit()" v-on="on" :color="PERMISSIONS.EDIT ? 'amber darken-2' : 'grey'" icon hide-details>
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span>Turn {{ !PERMISSIONS.EDIT ? 'On' : 'Off' }} Revise</span>
      </v-tooltip>
    </v-app-bar>

    <v-content>
      <nuxt />
    </v-content>

    <v-dialog v-model="dialog" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Inform player name</v-card-title>
        <v-card-text>
          <v-text-field v-model="dialogText" label="Player Name" color="amber darken-2" filled hide-details></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="submitPlayerName"
            :disabled="!(dialogText && dialogText !== '' && dialogText.length >= 5)"
            color="green darken-1"
            text
            >Confirm</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

// # for local storage
// eslint-disable-next-line no-unused-vars
import { getData, setData } from 'nuxt-storage/local-storage'
import { info } from '../utils/debug'
import { isValid } from '../utils/value'
import { nestedValue } from '../utils/permissions'

export default {
  data() {
    return {
      drawer: false,
      dialog: false,
      dialogText: undefined
    }
  },
  computed: {
    ...mapState('ui', ['PERMISSIONS', 'IDLE', 'LAST_ACTIVE']),
    ...mapState(['_id']),
    ...mapGetters(['GLOBAL_PERMISSIONS', 'STORE']),
    VIEW() {
      return (path) => {
        if (path === undefined) {
          if (this.GLOBAL_PERMISSIONS.view === undefined) return true
          const nested = nestedValue(this.GLOBAL_PERMISSIONS.view)
          return nested === undefined ? true : nested
        }

        const _nested = nestedValue(_.get(this.GLOBAL_PERMISSIONS.view || {}, path))
        return _nested === undefined ? true : _nested
      }
    }
  },
  created() {
    // info('LAYOUT CREATED')
    this.init()
    this.uiInit()
    this.charactersInit()

    if ('reset' in this.$route.query) setData('player', null)
    if ('player' in this.$route.query) setData('player', null)

    const player = getData('player') || this.$route.query.player

    if (!isValid(player)) {
      this.dialog = true
    } else {
      setData('player', player, 5, 'd')
    }

    if (player) {
      info(`Identified device as <${player}>`)
      this.signIn(player)
    }
  },
  mounted() {
    // info('LAYOUT MOUNTED')
    this.handleActive()
  },
  methods: {
    ...mapMutations('ui', { toogleEdit: 'toogleEdit' }),
    ...mapActions(['init', 'signIn', 'amOnline', 'amOffline']),
    ...mapActions('ui', { uiInit: 'init', setActive: 'setActive' }),
    ...mapActions('characters', { charactersInit: 'init' }),
    submitPlayerName() {
      const player = this.dialogText

      if (player) {
        setData('player', player, 5, 'd')
        info(`Identifing device as <${player}>`)
        this.signIn(player)
      }

      this.dialogText = undefined
      this.dialog = false
    },
    handleActive(event) {
      this.setActive()
    },
    showStore() {
      info('vuex Store', this.STORE)
    }
  }
}
</script>
