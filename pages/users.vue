<template>
  <div class="users">
    USERS: {{ users.length }}
    <v-list>
      <v-list-item v-for="user in users" :key="user._id" two-line>
        <v-list-item-content>
          <v-list-item-title class="d-flex flex-row font-weight-medium subtitle-1">
            <div>
              <v-badge :value="true" class="v-badge--bordered v-badge--dot" color="green" overlap dot>
                <span slot="badge" v-if="user.status === 'online'"></span>
                <span>{{ user.player }}</span>
              </v-badge>
              <span class="ml-2 caption font-weight-light font-italic grey--text darken-1">
                {{ user.__last_session.useragent.browser }} ({{ user.__last_session.useragent.version }})
              </span>
            </div>

            <v-spacer></v-spacer>

            <v-btn v-if="sendStack.includes(user._id)" @click="sendUpdate(user._id)" x-small light fab color="amber darken-1">
              <v-icon small color="black">mdi-arrow-up-bold</v-icon>
            </v-btn>
          </v-list-item-title>
          <v-list-item-subtitle class="grey--text darken-2">
            {{ $moment(user.__last_session.timestamp).fromNow() }}
          </v-list-item-subtitle>

          <v-expansion-panels depressed dense>
            <v-expansion-panel dense>
              <v-expansion-panel-header>
                Global
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-tabs height="50" show-arrows>
                  <v-tab :href="`#tab-__GLOBAL__`">GLOBAL</v-tab>

                  <v-tab-item value="tab-__GLOBAL__">
                    <!-- {{ permission(user._id, '__GLOBAL__') }} -->
                    <v-select
                      :items="permissions['__GLOBAL__']"
                      @change="
                        (value) => {
                          vueSet(user.permissions, ['__GLOBAL__'], defaultPermission(value))
                          sendStack.push(user._id)
                        }
                      "
                      class="mt-4"
                      filled
                      label="Default"
                      hide-details
                    ></v-select>
                    <v-nested-switch
                      :value="permission(user._id, '__GLOBAL__')"
                      @change="
                        ({ value, path }) => {
                          vueSet(user.permissions.__GLOBAL__, path, value)
                          sendStack.push(user._id)
                        }
                      "
                    ></v-nested-switch>
                  </v-tab-item>
                </v-tabs>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel v-for="tracker in trackers" :key="tracker._id" dense>
              <v-expansion-panel-header>
                <div>
                  <span>{{ tracker.name }}</span>
                  <span class="ml-2 caption grey--text">{{ tracker._id }}</span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-tabs height="50" show-arrows>
                  <v-tab
                    v-for="character in sortedTrackerCharacters(tracker)"
                    :key="character._id"
                    :href="`#tab-${character._id}`"
                  >
                    <div class="d-flex flex-column">
                      <span>{{ character.name }}</span>
                      <span class="caption">{{ character._id }}</span>
                    </div>
                  </v-tab>

                  <!-- {{ sortedTrackerCharacters(tracker) }} -->
                  <v-tab-item
                    v-for="character in sortedTrackerCharacters(tracker)"
                    :key="character._id"
                    :value="`tab-${character._id}`"
                  >
                    <!-- {{ permission(user._id, character._id) }} -->
                    <v-select
                      :items="permissions['__CHARACTER__']"
                      @change="
                        (value) => {
                          vueSet(user.permissions.__CHARACTER__, [character._id], defaultPermission(value))
                          sendStack.push(user._id)
                        }
                      "
                      class="mt-4"
                      filled
                      label="Default"
                      hide-details
                    ></v-select>
                    <v-nested-switch
                      :value="permission(user._id, character._id)"
                      @change="
                        ({ value, path }) => {
                          vueSet(user.permissions.__CHARACTER__, [character._id, ...path], value)
                          sendStack.push(user._id)
                        }
                      "
                    ></v-nested-switch>
                  </v-tab-item>
                </v-tabs>
                <!-- {{ user.permissions }} -->
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import nestedSwitchVue from '../components/forms/nestedSwitch.vue'
import { vueSet } from '../utils/object'
import { info } from '../utils/debug'
import { INDEX_DEFAULT, defaults } from '../utils/permissions'
import { sort } from '../utils/sort'

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    'v-nested-switch': nestedSwitchVue
  },
  data() {
    return {
      sendStack: [],
      permissions: INDEX_DEFAULT
    }
  },
  computed: {
    ...mapState('characters', {
      characterIndex: 'index'
    }),
    ...mapState('tracker', {
      trackerIndex: 'index'
    }),
    ...mapState('characters', {
      characterIndex: 'index'
    }),
    ...mapGetters('users', {
      permission: 'permission',
      users: 'sorted'
    }),
    ...mapState('users', {
      userIndex: 'index'
    }),
    characters() {
      return Object.values(this.characterIndex).sort((a, b) => sort(a.name, b.name))
    },
    trackers() {
      return Object.values(this.trackerIndex).sort((a, b) => sort(a.name, b.name))
    }
  },
  created() {
    this.init()
  },
  methods: {
    vueSet,
    defaultPermission: defaults,
    ...mapActions('users', ['init', 'notifyUserPermissionUpdated']),
    onChange(event) {
      info('USERS, ON CHANGE', event)
    },
    sendUpdate(_id) {
      // warn('Send user update through server not implemented', this.userIndex[_id].permissions)
      this.notifyUserPermissionUpdated({ user: _id, permissions: this.userIndex[_id].permissions })
      this.sendStack = this.sendStack.filter((id) => id !== _id)
    },
    sortedTrackerCharacters(tracker) {
      return Object.values(this.characterIndex)
        .filter((char) => tracker.characters.includes(char._id))
        .sort((a, b) => sort(a.name, b.name))
    }
  }
}
</script>

<style lang="sass" scoped>
.users
  .v-list::v-deep
    .v-list-item

      .v-expansion-panels
        margin-left: -16px
        margin-right: -16px

        .v-expansion-panel
          &::before
            box-shadow: none !important

  .v-badge::v-deep
    &.v-badge--dot .v-badge__badge
      border-radius: 4.5px
      height: 7px
      min-width: 0
      padding: 0
      width: 7px
      top: 0px
</style>
