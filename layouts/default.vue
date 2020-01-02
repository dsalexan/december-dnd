<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-list-item nuxt to="/tracker">
          <v-list-item-action>
            <v-icon>mdi-speedometer</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Initiative Tracker</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>December</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-tooltip left>
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
  </v-app>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  data() {
    return {
      drawer: false
    }
  },
  computed: {
    ...mapState('ui', ['PERMISSIONS'])
  },
  methods: {
    ...mapMutations('ui', ['toogleEdit'])
  }
}
</script>
