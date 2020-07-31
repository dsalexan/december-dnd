/* eslint-disable no-unused-vars */
import Vue from 'vue'
import _ from 'lodash'
import { FLUFF_INDEX, TOOLS_DATA_DIRECTORY } from '../../utils/data/constants'

import { pMultisourceLoad } from '@/services/multisource'
import { pPopulateMetaAndLanguages } from '~/services/renderer/monster'
import { hashData } from '~/utils/data/url'
import { sourceJSONToAbv, sourceJSONToFull, sourceJSONToColor } from '~/domain/source'

import CHARACTER from '~/domain/character'
import { warn, info } from '~/utils/debug'
import { SOURCES } from '~/domain/system/constants'
import { load } from '~/utils/data'
import { getPredefinedFluff } from '~/services/fluff'

const JSON_SRC_INDEX = 'index.json'

const log = info.extend('tools:bestiary')

export const namespaced = true

export const state = () => ({
  _index: 0,
  _addedHashes: new Set(),
  _: {
    loaded: false
  },
  // data,
  loaded: undefined,
  sources: {},
  references: {
    meta: {}
  },
  list: []
})

export const actions = {
  async load({ state, dispatch }) {
    if (!state._.loaded) {
      log('Load bestiary')

      const multisourceLoad = pMultisourceLoad('/data/bestiary/', 'monster', (data) => dispatch('addMonsters', { data }))
      const metaAndLanguagesLoad = pPopulateMetaAndLanguages()

      await Promise.all([multisourceLoad, metaAndLanguagesLoad])
      state.loaded = await multisourceLoad

      await dispatch('homebrew')

      Vue.set(state, 'sources', await multisourceLoad)
      const obj = await metaAndLanguagesLoad
      for (const key in obj) {
        Vue.set(state.references, key, obj[key])
      }

      state._.loaded = true

      dispatch('fluff')
    }

    return {
      loadedSources: state.sources,
      ...state.references
    }
  },
  async homebrew({ state, dispatch }) {
    // BrewUtil.pAddBrewData()
    //   .then(handleBrew)
    //   .then(() => BrewUtil.bind({ list })) // ? Why bind to list?
    //   .then(() => BrewUtil.pAddLocalBrewData()) // ? Unecessary
    //   .then(async () => {
    //     BrewUtil.makeBrewButton('manage-brew')
    //     BrewUtil.bind({ filterBox: bestiaryPage._pageFilter.filterBox, sourceFilter: bestiaryPage._pageFilter.sourceFilter })
    //     await ListUtil.pLoadState()
    //     resolve()
    //   })
    const data = await dispatch('tools/brew/init', undefined, { root: true })

    // handleBrew
    dispatch('addLegendaryGroups', { data: data.legendaryGroup })
    dispatch('addMonsters', { data: data.monster })
  },
  async fluff({ state, dispatch }) {
    const index = await load('/data/bestiary/' + 'fluff-index.json')
    const legendaryMeta = state.references.meta

    log('Starting fluff')

    for (const item of state.list) {
      if (index[item.source]) {
        // has fluff page for source
        const fluffJson = await load(`/data/bestiary/${index[item.source]}`)

        const predefined = getPredefinedFluff(item, 'monsterFluff')

        const rawFluff =
          predefined || (fluffJson || { monster: [] }).monster.find((it) => it.name === item.name && it.source === item.source)

        if (!rawFluff) continue
        const fluff = _.cloneDeep(rawFluff)

        // TODO: is this good enough? Should additionally check for lair blocks which are not the last, and tag them with
        //   "data": {"lairRegionals": true}, and insert the lair/regional
        //    text there if available (do the current "append" otherwise)
        let hasAddedLegendary = false
        // eslint-disable-next-line no-inner-declarations
        function addLegendaryGroup(fluff) {
          if (hasAddedLegendary) return
          hasAddedLegendary = true
          const thisGroup = legendaryMeta[item.legendaryGroup.source][item.legendaryGroup.name]
          const handleProp = (prop, name) => {
            if (thisGroup[prop]) {
              fluff.entries.push({
                type: 'section',
                entries: [
                  {
                    type: 'entries',
                    entries: [
                      {
                        type: 'entries',
                        name,
                        entries: _.cloneDeep(thisGroup[prop])
                      }
                    ]
                  }
                ]
              })
            }
          }

          handleProp('lairActions', 'Lair Actions')
          handleProp('regionalEffects', 'Regional Effects')
        }

        if (fluff.entries && item.legendaryGroup && (legendaryMeta[item.legendaryGroup.source] || {})[item.legendaryGroup.name]) {
          addLegendaryGroup(fluff)
        }

        // eslint-disable-next-line no-inner-declarations
        function handleRecursive(ptrFluff) {
          const fluff = _.cloneDeep(ptrFluff.fluff)
          ptrFluff.fluff = fluff
          const cachedAppendCopy = fluff._appendCopy // prevent _copy from overwriting this

          if (fluff._copy) {
            const cpy = _.cloneDeep(
              fluffJson.monster.find((it) => fluff._copy.name === it.name && fluff._copy.source === it.source)
            )
            // preserve these
            const { name } = fluff
            const src = fluff.source
            const { images } = fluff

            // remove this
            delete fluff._copy

            Object.assign(fluff, cpy)
            fluff.name = name
            fluff.source = src
            if (images) fluff.images = images

            if (
              fluff.entries &&
              item.legendaryGroup &&
              (legendaryMeta[item.legendaryGroup.source] || {})[item.legendaryGroup.name]
            ) {
              addLegendaryGroup(fluff)
            }

            handleRecursive(ptrFluff)
          }

          if (cachedAppendCopy) {
            const cpy = _.cloneDeep(
              fluffJson.monster.find((it) => cachedAppendCopy.name === it.name && cachedAppendCopy.source === it.source)
            )
            if (cpy.images) {
              if (!fluff.images) fluff.images = cpy.images
              else fluff.images = fluff.images.concat(cpy.images)
            }
            if (cpy.entries) {
              if (!fluff.entries) fluff.entries = cpy.entries
              else if ((cpy.entries[0] || {}).type !== 'section') {
                fluff.entries = fluff.entries.concat({ type: 'section', entries: cpy.entries })
              } else fluff.entries = fluff.entries.concat(cpy.entries)
            }
            delete fluff._appendCopy

            fluff._copy = cpy._copy
            fluff._appendCopy = cpy._appendCopy

            if (
              fluff.entries &&
              item.legendaryGroup &&
              (legendaryMeta[item.legendaryGroup.source] || {})[item.legendaryGroup.name]
            ) {
              addLegendaryGroup(fluff)
            }

            handleRecursive(ptrFluff)
          }
        }

        const ptrFluff = { fluff }
        if (ptrFluff.fluff._copy || ptrFluff.fluff._appendCopy) {
          handleRecursive(ptrFluff)
        }

        item.fluff = ptrFluff.fluff
      }
    }

    log('Finishing fluff')
  },
  // ADDERS
  addMonsters({ state, commit, dispatch }, { data }) {
    if (!data || !data.length) return
    if (!_.isArray(data)) data = [data]

    log('Add Monsters', data.length)

    state.list.splice(state._index + 1, 0, ...data)

    const list = []

    for (; state._index < state.list.length; state._index++) {
      const mon = state.list[state._index]
      mon._index = state._index

      const hash = hashData(mon, 'bestiary.html')
      mon._hash = hash
      if (!mon.uniqueId && state._addedHashes.has(hash)) {
        // warning('Non-unique monster', mon)
        continue // ? WHY?
      }
      state._addedHashes.add(hash)

      CHARACTER.make(mon)
      dispatch('ui/filter/character/addToList', { mon }, { root: true })
    }

    dispatch('ui/filter/character/selectDefault', undefined, { root: true })
    dispatch('ui/filter/character/doSearch', undefined, { root: true })

    log('Finishing Add Monsters', list)
  },
  addLegendaryGroups({ state, dispatch }, { data }) {
    if (!data || !data.length) return

    data.forEach((lg) => {
      Vue.set(state.references.meta, lg.source, state.references.meta[lg.source] || {})
      Vue.set(state.references.meta[lg.source], lg.name, lg)
    })
  }
}
