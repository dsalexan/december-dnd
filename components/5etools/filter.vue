<template>
  <div class="tool-filter">
    <!-- 5E FILTER -->

    <div class="header">
      <v-btn @click="dialog = true" small>
        <span>Filter</span>
        <v-icon right>mdi-filter</v-icon>
      </v-btn>

      <v-text-field small prepend-inner-icon="mdi-magnify" suffix="1277/1258" solo dark></v-text-field>

      <v-btn small>
        <v-icon>mdi-shuffle</v-icon>
      </v-btn>

      <v-btn small>
        <span>Reset</span>
        <v-icon right>mdi-reload</v-icon>
      </v-btn>
    </div>
    <div class="tags">
      <v-hover v-slot:default="{ hover }" v-for="tag in tags" :key="tag.id">
        <v-chip :close="hover" :color="tag.color" @click:close="removeTag(tag.id)" label class="ma-1" small>
          {{ tag.text }}
        </v-chip>
      </v-hover>
    </div>
    <v-data-table
      :headers="headers"
      :items="values"
      :multi-sort="true"
      :hide-default-footer="true"
      :disable-pagination="true"
      dark
      dense
      class="elevation-1"
    ></v-data-table>

    <v-dialog v-model="dialog">
      <v-card v-if="dialog" class="filter-dialog-card">
        <v-card-title class="d-flex flex-row justify-space-between">
          <span class="subtitle-1">Filters</span>

          <span class="caption d-flex flex-row align-center">
            <span class="mr-2">Combine filters as...</span>
            <v-btn color="grey darken-2" class="mx-2" depressed small>AND</v-btn>

            <div class="btn-group mx-2">
              <v-btn @click="showAll" color="grey darken-2" depressed small>Show All</v-btn>
              <v-btn @click="hideAll" color="grey darken-2" depressed small>Hide All</v-btn>
            </div>
            <v-btn color="grey darken-2" class="mx-2" depressed small>Reset</v-btn>

            <v-btn color="grey darken-2" class="mx-2" depressed small>
              <v-icon small>mdi-settings</v-icon>
            </v-btn>
          </span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-expansion-panels v-model="panel" accordion multiple>
            <v-expansion-panel v-for="(summary, i) in summaries" :key="i">
              <v-expansion-panel-header>
                {{ summary.header }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div class="d-flex flex-row justify-end mb-2 align-center">
                  <v-btn
                    v-if="summary.model.hasMultiple"
                    @click="summary.toogleMultiple()"
                    :color="summary.multiple ? 'grey darken-4' : 'grey darken-3'"
                    class="mr-4"
                    depressed
                    small
                    >Multiple</v-btn
                  >

                  <div v-for="(group, index) in summary.groups" :key="index">
                    <v-btn
                      v-if="!group.hide"
                      @click="summary.setStateGroup(group)"
                      color="grey darken-2"
                      class="ma-1 text-uppercase"
                      depressed
                      small
                      >{{ group.name }}</v-btn
                    >
                  </div>

                  <div v-if="summary.model.hasGenericSelection" class="btn-group ml-5">
                    <v-btn
                      @click="summary.includeAll()"
                      color="grey darken-2"
                      class=" text-uppercase blue--text text--lighten-1"
                      depressed
                      small
                      >All</v-btn
                    >
                    <v-btn @click="summary.unselectAll()" color="grey darken-2" class=" text-uppercase" depressed small
                      >Clear</v-btn
                    >
                    <v-btn
                      @click="summary.excludeAll()"
                      color="grey darken-2"
                      class=" text-uppercase red--text text--lighten-1"
                      depressed
                      small
                      >None</v-btn
                    >
                    <v-btn @click="summary.selectDefault()" color="grey darken-2" class=" text-uppercase" depressed small
                      >Default</v-btn
                    >
                  </div>
                </div>
                <div v-for="(group, g) in summary.items" :key="g">
                  <v-divider class="my-1"></v-divider>
                  <template v-if="summary.model.type === 'tag'">
                    <v-btn
                      v-for="(item, index) in group"
                      :key="index"
                      @click="item.toogleState()"
                      :color="entryColor(item.state)"
                      class="ma-1"
                      depressed
                      small
                      >{{ summary.displayFn(item) }}</v-btn
                    >
                  </template>
                  <template v-else>
                    <v-range-slider
                      :min="summary.model.min || 0"
                      :max="summary.model.max || group.length - 1"
                      :value="summary.value"
                      step="1"
                      ticks="always"
                      tick-size="2"
                      thumb-label
                    >
                      <template v-slot:thumb-label="props">
                        {{ summary.model.isLabelled ? group[props.value].data : props.value }}
                      </template></v-range-slider
                    >
                  </template>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

// eslint-disable-next-line no-unused-vars
import { STATES, STATES_PROGRESSION } from '@/domain/filter/item'

export default {
  name: 'tool-filter',
  props: {
    filter: {
      type: Object,
      default: () => ({
        filters: {}
      })
    }
  },
  data() {
    return {
      // FILTER-DIALOG
      dialog: false,
      panel: [],
      // RESULT-FORM
      tags: [
        {
          id: 'asdas',
          text: "Player's Handbook",
          color: 'blue darken-4'
        },
        {
          id: 'asda212',
          text: "Volo's Guide to Monsters",
          color: 'blue darken-4'
        },
        {
          id: 'dfsd2',
          text: "Dungeon Master's Guide",
          color: 'blue darken-4'
        },
        {
          id: 'asdfe3232',
          text: 'Monster Manual',
          color: 'blue darken-4'
        },
        {
          id: 'sadasd212',
          text: 'Adventure NPC',
          color: 'red darken-4'
        }
      ],
      headers: [
        {
          text: 'Name',
          align: 'left',
          value: 'name'
        },
        { text: 'Type', value: 'type.asText' },
        { text: 'CR/Level', value: 'cr_level' },
        { text: 'Source', value: 'source' }
      ],
      values: [
        {
          name: 'Luke Undell',
          type: {
            asText: 'Humanoid (Human)'
          },
          cr_level: 5,
          source: 'FCS'
        }
      ]
    }
  },
  computed: {
    ...mapState('ui/filter/character', ['filters', 'references']),
    summaries() {
      return Object.values(this.filters)
    }
  },
  mounted() {
    this.filterInit().then(
      function() {
        this.loadBestiary().then(
          function({ loadedSources, meta, languages }) {
            this.setReference({ key: 'languages', data: languages })
            this.setReference({ key: 'meta', data: meta })

            this.filters.source.clear()
            Object.keys(loadedSources)
              // .map(src => new FilterItem({item: src, changeFn: loadSource(JSON_LIST_NAME, addMonsters)}))
              .forEach((fi) => this.filters.source.addItem(fi))

            this.filters.language.clear()
            Object.keys(languages)
              // .map(src => new FilterItem({item: src, changeFn: loadSource(JSON_LIST_NAME, addMonsters)}))
              .forEach((key) => this.filters.language.addItem(key))

            console.log('MOUNTED', this.references)
          }.bind(this)
        )
      }.bind(this)
    )
  },
  methods: {
    ...mapMutations('ui/filter/character', ['setReference']),
    ...mapActions('tools', ['loadBestiary']),
    ...mapActions('ui/filter/character', {
      filterInit: 'init'
    }),
    removeTag(id) {
      const index = this.tags.findIndex((t) => t.id === id)
      this.tags.splice(index, 1)
    },
    // filter-dialog
    // TAG
    entryColor(state) {
      if (state === STATES.INACTIVE) return 'grey darken-4'
      else if (state === STATES.INCLUDE_ENTRY) return 'blue darken-3'
      else if (state === STATES.EXCLUDE_ENTRY) return 'red darken-3'
    },

    showAll() {
      this.panel = [...Array(this.summaries.length).keys()]
    },
    hideAll() {
      this.panel = []
    }
  }
}
</script>

<style lang="sass" scoped>
.tool-filter
  .v-btn-toggle > .v-btn.v-btn:first-child
    border-bottom-left-radius: 0

  .v-btn-toggle > .v-btn.v-btn:last-child
    border-bottom-right-radius: 0

  .header
    display: flex

    .v-btn
      border-radius: 0
      box-shadow: none
      opacity: 0.8
      height: 36px

      &:first-child
        border-top-left-radius: 5px

      &:last-child
        border-top-right-radius: 5px

    .v-text-field::v-deep
      &, .v-input__control
        height: 36px
        min-height: 36px

      .v-input__slot
        margin-bottom: 0px
        box-shadow: none
        background-color: #1a1a1a
        border-radius: 0

        .v-text-field__suffix
          font-size: 0.9em

        .v-input__icon--prepend-inner
          i
            font-size: 18px

  .tags
    background-color: #212121
    padding: 5px 10px

  .v-data-table::v-deep
    background-color: rgba(#212121, 0.8)
    border-bottom-right-radius: 5px
    border-bottom-left-radius: 5px

    table
      margin-bottom: 5px

.filter-dialog-card
  .v-card__text
    padding: 0

    .v-expansion-panel::v-deep
      .v-expansion-panel-header
        min-height: 32px
        padding: 12px 24px

      .v-expansion-panel-content
        .v-expansion-panel-content__wrap
          padding: 0 20px
          padding-bottom: 12px

  .v-btn
    text-transform: initial
    font-weight: 400
</style>

<style lang="sass">
.btn-group
  display: flex
  flex-direction: row

  .v-btn
    border-radius: 0

    &:first-child
      border-top-left-radius: 4px
      border-bottom-left-radius: 4px

    &:last-child
      border-top-right-radius: 4px
      border-bottom-right-radius: 4px
</style>
