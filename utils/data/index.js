import _ from 'lodash'

import { sortLower } from '../sort'
import ADAPTER from './adapter'
import { HASH_BUILDER } from './url'
import { BASE_URL, PAGES } from '~/utils/data/constants'
import SYSTEM from '@/utils/system'

async function fetch(url) {
  if (ADAPTER.loading(url) === undefined) {
    ADAPTER.loading(
      url,
      new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open('GET', url, true)
        request.overrideMimeType('application/json')
        // info('REQUEST', url)
        request.onload = () => {
          // info('REQUEST LOADED', url, request)
          try {
            ADAPTER.loaded(url, JSON.parse(request.response))
            resolve()
          } catch (e) {
            reject(new Error(`Could not parse JSON from ${url}: ${e.message}`))
          }
        }
        request.onerror = (e) => reject(new Error(`Error during JSON request: ${e.target.status}`))
        request.send()
      })
    )
  }

  await ADAPTER.loading(url)
  return ADAPTER.loaded(url)
}

/**
 * Loads JSON for informed url (load json response and merge if has _copy properties)
 * @param {String} url
 * @param  {...any} otherData ??
 */
export async function load(url, ...otherData) {
  const data = await fetch(url)

  await merge(url, data)

  return data
}

/**
 * Search a value inside data/{key} and load correspondent index (found in data/index.json)
 * @param {String} key Directory inside data/, e.g. bestiary or class
 * @param {String} value e.g. PHB or BGDIA
 */
async function loadIndexedURL(key, value) {
  // eslint-disable-next-line max-len
  // TODO in future, allow value to be e.g. a string (assumed to be an official data's source); an object e.g. `{type: external, url: <>}`,...
  switch (key) {
    case 'monster': {
      const index = await load(`${BASE_URL}data/bestiary/index.json`)
      if (!index[value]) throw new Error(`Bestiary index did not contain source "${value}"`)
      return `${BASE_URL}data/bestiary/${index[value]}`
    }
    default:
      throw new Error(`Could not get loadable URL for \`${JSON.stringify({ key, value })}\``)
  }
}

/**
 * Merge data from specific url with its copies specified internally
 * @param {String} url
 * @param {Object} data JSON parsed object
 * @param {Object} options
 */
async function merge(url, data, options) {
  ADAPTER.merging(url, ADAPTER.merging(url) || helper_merge(url, data, options))
  await ADAPTER.merging(url)
  return ADAPTER.merged(url)
}

async function helper_merge(ident, data, options) {
  if (data._meta) {
    if (data._meta.dependencies) {
      await Promise.all(
        Object.entries(data._meta.dependencies).map(async ([prop, sources]) => {
          if (!data[prop]) return // if e.g. monster dependencies are declared, but there are no monsters to merge with, bail out

          const toLoads = await Promise.all(sources.map((source) => loadIndexedURL(prop, source)))
          const dependencyData = await Promise.all(toLoads.map((toLoad) => load(toLoad)))
          const flatDependencyData = dependencyData.map((dd) => dd[prop]).flat()
          await Promise.all(
            data[prop].map((entry) => {
              if (entry._copy) {
                switch (prop) {
                  case 'monster':
                    return monster.pMergeCopy(flatDependencyData, entry, options)
                  default:
                    throw new Error(`No dependency _copy merge strategy specified for property "${prop}"`)
                }
              }
            })
          )
        })
      )
      delete data._meta.dependencies
    }

    if (data._meta.internalCopies) {
      Promise.all(
        data._meta.internalCopies.map(async (prop) => {
          if (!data[prop]) return

          await Promise.all(
            data[prop].map((entry) => {
              if (entry._copy) {
                switch (prop) {
                  case 'monster':
                    return monster.pMergeCopy(data[prop], entry, options)
                  default:
                    throw new Error(`No internal _copy merge strategy specified for property "${prop}"`)
                }
              }
            })
          )
        })
      )
      delete data._meta.internalCopies
    }
  }

  if (data._meta && data._meta.otherSources) {
    await Promise.all(
      Object.entries(data._meta.otherSources).map(async ([prop, sources]) => {
        const toLoads = await Promise.all(
          Object.entries(sources).map(async ([source, findWith]) => ({
            findWith,
            url: await loadIndexedURL(prop, source)
          }))
        )

        const additionalData = await Promise.all(
          toLoads.map(async ({ findWith, url }) => ({ findWith, sourceData: await load(url) }))
        )

        additionalData.forEach((dataAndSource) => {
          const findWith = dataAndSource.findWith
          const ad = dataAndSource.sourceData
          const toAppend = ad[prop].filter((it) => it.otherSources && it.otherSources.find((os) => os.source === findWith))
          if (toAppend.length) data[prop] = (data[prop] || []).concat(toAppend)
        })
      })
    )
    delete data._meta.otherSources
  }

  ADAPTER.merged(ident, data)
}

const generic = (function() {
  return {
    _pMergeCopy
  }

  function _pMergeCopy(impl, page, entryList, entry, options) {
    if (entry._copy) {
      const hash = HASH_BUILDER[page](entry._copy)
      const it = impl._mergeCache[hash] || _pMergeCopy_search(impl, page, entryList, entry)
      if (!it) return
      return _pApplyCopy(impl, _.cloneDeep(it), entry, options)
    }
  }

  function _pMergeCopy_search(impl, page, entryList, entry) {
    return entryList.find((it) => {
      impl._mergeCache[HASH_BUILDER[page](it)] = it
      return it.name === entry._copy.name && it.source === entry._copy.source
    })
  }

  async function _pApplyCopy(impl, copyFrom, copyTo, options = {}) {
    if (options.doKeepCopy) copyTo.__copy = _.cloneDeep(copyFrom)

    // convert everything to arrays
    function normaliseMods(obj) {
      Object.entries(obj._mod).forEach(([k, v]) => {
        if (!Array.isArray(v)) obj._mod[k] = [v]
      })
    }

    const copyMeta = copyTo._copy || {}

    if (copyMeta._mod) normaliseMods(copyMeta)

    // fetch and apply any external traits -- append them to existing copy mods where available
    let racials = null
    if (copyMeta._trait) {
      const traitData = await load(`${BASE_URL}data/bestiary/traits.json`)
      racials = traitData.trait.find(
        (t) =>
          t.name.toLowerCase() === copyMeta._trait.name.toLowerCase() &&
          t.source.toLowerCase() === copyMeta._trait.source.toLowerCase()
      )
      if (!racials)
        throw new Error(
          `Could not find traits to apply with name "${copyMeta._trait.name}" and source "${copyMeta._trait.source}"`
        )
      racials = _.cloneDeep(racials)

      if (racials.apply._mod) {
        normaliseMods(racials.apply)

        if (copyMeta._mod) {
          Object.entries(racials.apply._mod).forEach(([k, v]) => {
            if (copyMeta._mod[k]) copyMeta._mod[k] = copyMeta._mod[k].concat(v)
            else copyMeta._mod[k] = v
          })
        } else copyMeta._mod = racials.apply._mod
      }

      delete copyMeta._trait
    }

    // copy over required values
    Object.keys(copyFrom).forEach((k) => {
      if (copyTo[k] === null) return delete copyTo[k]
      if (copyTo[k] == null) {
        if (impl._MERGE_REQUIRES_PRESERVE[k]) {
          if (copyTo._copy._preserve && copyTo._copy._preserve[k]) copyTo[k] = copyFrom[k]
        } else copyTo[k] = copyFrom[k]
      }
    })

    // apply any root racial properties after doing base copy
    if (racials && racials.apply._root) Object.entries(racials.apply._root).forEach(([k, v]) => (copyTo[k] = v))

    // mod helpers /////////////////
    function doEnsureArray(obj, prop) {
      if (!Array.isArray(obj[prop])) obj[prop] = [obj[prop]]
    }

    function doMod_appendStr(modInfo, prop) {
      if (copyTo[prop]) copyTo[prop] = `${copyTo[prop]}${modInfo.joiner || ''}${modInfo.str}`
      else copyTo[prop] = modInfo.str
    }

    function doMod_replaceTxt(modInfo, prop) {
      const re = new RegExp(modInfo.replace, `g${modInfo.flags || ''}`)
      if (copyTo[prop]) {
        copyTo[prop].forEach((it) => {
          if (it.entries) it.entries = JSON.parse(JSON.stringify(it.entries).replace(re, modInfo.with))
          if (it.headerEntries) it.headerEntries = JSON.parse(JSON.stringify(it.headerEntries).replace(re, modInfo.with))
          if (it.footerEntries) it.footerEntries = JSON.parse(JSON.stringify(it.footerEntries).replace(re, modInfo.with))
        })
      }
    }

    function doMod_prependArr(modInfo, prop) {
      doEnsureArray(modInfo, 'items')
      copyTo[prop] = copyTo[prop] ? modInfo.items.concat(copyTo[prop]) : modInfo.items
    }

    function doMod_appendArr(modInfo, prop) {
      doEnsureArray(modInfo, 'items')
      copyTo[prop] = copyTo[prop] ? copyTo[prop].concat(modInfo.items) : modInfo.items
    }

    function doMod_replaceArr(modInfo, prop, isThrow = true) {
      doEnsureArray(modInfo, 'items')

      if (!copyTo[prop]) {
        if (isThrow) throw new Error(`Could not find "${prop}" array`)
        return false
      }

      let ixOld
      if (modInfo.replace.regex) {
        const re = new RegExp(modInfo.replace.regex, modInfo.replace.flags || '')
        ixOld = copyTo[prop].findIndex((it) => (it.name ? re.test(it.name) : typeof it === 'string' ? re.test(it) : false))
      } else if (modInfo.replace.index != null) {
        ixOld = modInfo.replace.index
      } else {
        ixOld = copyTo[prop].findIndex((it) => (it.name ? it.name === modInfo.replace : it === modInfo.replace))
      }

      if (~ixOld) {
        copyTo[prop].splice(ixOld, 1, ...modInfo.items)
        return true
      } else if (isThrow) throw new Error(`Could not find "${prop}" item with name "${modInfo.replace}" to replace`)
      return false
    }

    function doMod_replaceOrAppendArr(modInfo, prop) {
      const didReplace = doMod_replaceArr(modInfo, prop, false)
      if (!didReplace) doMod_appendArr(modInfo, prop)
    }

    function doMod_insertArr(modInfo, prop) {
      doEnsureArray(modInfo, 'items')
      if (!copyTo[prop]) throw new Error(`Could not find "${prop}" array`)
      copyTo[prop].splice(modInfo.index, 0, ...modInfo.items)
    }

    function doMod_removeArr(modInfo, prop) {
      if (modInfo.names) {
        doEnsureArray(modInfo, 'names')
        modInfo.names.forEach((nameToRemove) => {
          const ixOld = copyTo[prop].findIndex((it) => it.name === nameToRemove)
          if (~ixOld) copyTo[prop].splice(ixOld, 1)
          else throw new Error(`Could not find "${prop}" item with name "${nameToRemove}" to remove`)
        })
      } else if (modInfo.items) {
        doEnsureArray(modInfo, 'items')
        modInfo.items.forEach((itemToRemove) => {
          const ixOld = copyTo[prop].findIndex((it) => it === itemToRemove)
          if (~ixOld) copyTo[prop].splice(ixOld, 1)
          else throw new Error(`Could not find "${prop}" item "${itemToRemove}" to remove`)
        })
      } else throw new Error(`One of "names" or "items" must be provided!`)
    }

    function doMod_calculateProp(modInfo, prop) {
      copyTo[prop] = copyTo[prop] || {}
      const toExec = modInfo.formula.replace(/<\$([^$]+)\$>/g, (...m) => {
        switch (m[1]) {
          case 'prof_bonus':
            return SYSTEM.CR.toProficiencyBonus(copyTo.cr) // Parser.crToPb(copyTo.cr)
          case 'dex_mod':
            return SYSTEM.modifier(copyTo.dex) // Parser.getAbilityModNumber(copyTo.dex)
          default:
            throw new Error(`Unknown variable "${m[1]}"`)
        }
      })
      // eslint-disable-next-line no-eval
      copyTo[prop][modInfo.prop] = eval(toExec)
    }

    function doMod_scalarAddProp(modInfo, prop) {
      function applyTo(k) {
        const out = Number(copyTo[prop][k]) + modInfo.scalar
        const isString = typeof copyTo[prop][k] === 'string'
        copyTo[prop][k] = isString ? `${out >= 0 ? '+' : ''}${out}` : out
      }

      if (!copyTo[prop]) return
      if (modInfo.prop === '*') Object.keys(copyTo[prop]).forEach((k) => applyTo(k))
      else applyTo(modInfo.prop)
    }

    function doMod_scalarMultProp(modInfo, prop) {
      function applyTo(k) {
        let out = Number(copyTo[prop][k]) * modInfo.scalar
        if (modInfo.floor) out = Math.floor(out)
        const isString = typeof copyTo[prop][k] === 'string'
        copyTo[prop][k] = isString ? `${out >= 0 ? '+' : ''}${out}` : out
      }

      if (!copyTo[prop]) return
      if (modInfo.prop === '*') Object.keys(copyTo[prop]).forEach((k) => applyTo(k))
      else applyTo(modInfo.prop)
    }

    function doMod_addSenses(modInfo) {
      doEnsureArray(modInfo, 'senses')
      copyTo.senses = copyTo.senses || []
      modInfo.senses.forEach((sense) => {
        let found = false
        for (let i = 0; i < copyTo.senses.length; ++i) {
          const m = new RegExp(`${sense.type} (\\d+)`, 'i').exec(copyTo.senses[i])
          if (m) {
            found = true
            // if the creature already has a greater sense of this type, do nothing
            if (Number(m[1]) < sense.type) {
              copyTo.senses[i] = `${sense.type} ${sense.range} ft.`
            }
            break
          }
        }

        if (!found) copyTo.senses.push(`${sense.type} ${sense.range} ft.`)
      })
    }

    function doMod_addSkills(modInfo) {
      copyTo.skill = copyTo.skill || []
      Object.entries(modInfo.skills).forEach(([skill, mode]) => {
        // mode: 1 = proficient; 2 = expert
        // const total = mode * Parser.crToPb(copyTo.cr) + Parser.getAbilityModNumber(copyTo[Parser.skillToAbilityAbv(skill)])
        const total =
          mode * SYSTEM.CR.toProficiencyBonus(copyTo.cr) +
          SYSTEM.modifier(copyTo[SYSTEM._.SKILLS.FULL_TO_ABILITY_ABBREVIATION.A(skill)])

        const asText = total >= 0 ? `+${total}` : `-${total}`
        if (copyTo.skill && copyTo.skill[skill]) {
          // update only if ours is larger (prevent reduction in skill score)
          if (Number(copyTo.skill[skill]) < total) copyTo.skill[skill] = asText
        } else copyTo.skill[skill] = asText
      })
    }

    function doMod_addSpells(modInfo) {
      if (!copyTo.spellcasting) throw new Error(`Creature did not have a spellcasting property!`)

      // TODO could accept a "position" or "name" parameter should spells need to be added to other spellcasting traits
      const spellcasting = copyTo.spellcasting[0]

      if (modInfo.spells) {
        const spells = spellcasting.spells

        Object.keys(modInfo.spells).forEach((k) => {
          if (!spells[k]) spells[k] = modInfo.spells[k]
          else {
            // merge the objects
            const spellCategoryNu = modInfo.spells[k]
            const spellCategoryOld = spells[k]
            Object.keys(spellCategoryNu).forEach((kk) => {
              if (!spellCategoryOld[kk]) spellCategoryOld[kk] = spellCategoryNu[kk]
              else if (typeof spellCategoryOld[kk] === 'object') {
                if (Array.isArray(spellCategoryOld[kk])) {
                  // .sort(SortUtil.ascSortLower)
                  spellCategoryOld[kk] = spellCategoryOld[kk].concat(spellCategoryNu[kk]).sort(sortLower)
                } else {
                  throw new TypeError(`Object at key ${kk} not an array!`)
                }
              } else {
                spellCategoryOld[kk] = spellCategoryNu[kk]
              }
            })
          }
        })
      }

      if (modInfo.will) {
        modInfo.will.forEach((sp) => (modInfo.will = modInfo.will || []).push(sp))
      }

      if (modInfo.daily) {
        for (let i = 1; i <= 9; ++i) {
          const e = `${i}e`

          spellcasting.daily = spellcasting.daily || {}

          if (modInfo.daily[i]) {
            modInfo.daily[i].forEach((sp) => (spellcasting.daily[i] = spellcasting.daily[i] || []).push(sp))
          }

          if (modInfo.daily[e]) {
            modInfo.daily[e].forEach((sp) => (spellcasting.daily[e] = spellcasting.daily[e] || []).push(sp))
          }
        }
      }
    }

    function doMod_replaceSpells(modInfo) {
      if (!copyTo.spellcasting) throw new Error(`Creature did not have a spellcasting property!`)

      // TODO could accept a "position" or "name" parameter should spells need to be added to other spellcasting traits
      const spellcasting = copyTo.spellcasting[0]

      const handleReplace = (curSpells, replaceMeta, k) => {
        doEnsureArray(replaceMeta, 'with')

        const ix = curSpells[k].indexOf(replaceMeta.replace)
        if (~ix) {
          curSpells[k].splice(ix, 1, ...replaceMeta.with)
          curSpells[k].sort(sortLower)
        } else throw new Error(`Could not find spell "${replaceMeta.replace}" to replace`)
      }

      if (modInfo.spells) {
        const trait0 = spellcasting.spells
        Object.keys(modInfo.spells).forEach((k) => {
          // k is e.g. "4"
          if (trait0[k]) {
            const replaceMetas = modInfo.spells[k]
            const curSpells = trait0[k]
            replaceMetas.forEach((replaceMeta) => handleReplace(curSpells, replaceMeta, 'spells'))
          }
        })
      }

      // TODO should be extended  to handle all non-slot-based spellcasters
      if (modInfo.daily) {
        for (let i = 1; i <= 9; ++i) {
          const e = `${i}e`

          if (modInfo.daily[i]) {
            modInfo.daily[i].forEach((replaceMeta) => handleReplace(spellcasting.daily, replaceMeta, i))
          }

          if (modInfo.daily[e]) {
            modInfo.daily[e].forEach((replaceMeta) => handleReplace(spellcasting.daily, replaceMeta, e))
          }
        }
      }
    }

    function doMod_scalarAddHit(modInfo, prop) {
      if (!copyTo[prop]) return
      copyTo[prop] = JSON.parse(
        JSON.stringify(copyTo[prop]).replace(/{@hit ([-+]?\d+)}/g, (m0, m1) => `{@hit ${Number(m1) + modInfo.scalar}}`)
      )
    }

    function doMod_scalarAddDc(modInfo, prop) {
      if (!copyTo[prop]) return
      copyTo[prop] = JSON.parse(
        JSON.stringify(copyTo[prop]).replace(/{@dc (\d+)}/g, (m0, m1) => `{@dc ${Number(m1) + modInfo.scalar}}`)
      )
    }

    function doMod_maxSize(modInfo) {
      const ixCur = SYSTEM._.SIZES.LIST_ABBREVIATIONS.indexOf(copyTo.size) // Parser.SIZE_ABVS.indexOf(copyTo.size)
      const ixMax = SYSTEM._.SIZES.LIST_ABBREVIATIONS.indexOf(modInfo.max) // Parser.SIZE_ABVS.indexOf(modInfo.max)
      if (ixCur < 0 || ixMax < 0) throw new Error(`Unhandled size!`)
      copyTo.size = SYSTEM._.SIZES.LIST_ABBREVIATIONS[Math.min(ixCur, ixMax)] // Parser.SIZE_ABVS[Math.min(ixCur, ixMax)]
    }

    function doMod_scalarMultXp(modInfo) {
      function getOutput(input) {
        let out = input * modInfo.scalar
        if (modInfo.floor) out = Math.floor(out)
        return out
      }

      if (copyTo.cr.xp) copyTo.cr.xp = getOutput(copyTo.cr.xp)
      else {
        const curXp = SYSTEM.CR.toNumber(copyTo.cr) // Parser.crToXpNumber(copyTo.cr)
        if (!copyTo.cr.cr) copyTo.cr = { cr: copyTo.cr }
        copyTo.cr.xp = getOutput(curXp)
      }
    }

    function doMod(modInfos, ...properties) {
      function handleProp(prop) {
        modInfos.forEach((modInfo) => {
          if (typeof modInfo === 'string') {
            switch (modInfo) {
              case 'remove':
                return delete copyTo[prop]
              default:
                throw new Error(`Unhandled mode: ${modInfo}`)
            }
          } else {
            switch (modInfo.mode) {
              case 'appendStr':
                return doMod_appendStr(modInfo, prop)
              case 'replaceTxt':
                return doMod_replaceTxt(modInfo, prop)
              case 'prependArr':
                return doMod_prependArr(modInfo, prop)
              case 'appendArr':
                return doMod_appendArr(modInfo, prop)
              case 'replaceArr':
                return doMod_replaceArr(modInfo, prop)
              case 'replaceOrAppendArr':
                return doMod_replaceOrAppendArr(modInfo, prop)
              case 'insertArr':
                return doMod_insertArr(modInfo, prop)
              case 'removeArr':
                return doMod_removeArr(modInfo, prop)
              case 'calculateProp':
                return doMod_calculateProp(modInfo, prop)
              case 'scalarAddProp':
                return doMod_scalarAddProp(modInfo, prop)
              case 'scalarMultProp':
                return doMod_scalarMultProp(modInfo, prop)
              // bestiary specific
              case 'addSenses':
                return doMod_addSenses(modInfo)
              case 'addSkills':
                return doMod_addSkills(modInfo)
              case 'addSpells':
                return doMod_addSpells(modInfo)
              case 'replaceSpells':
                return doMod_replaceSpells(modInfo)
              case 'scalarAddHit':
                return doMod_scalarAddHit(modInfo, prop)
              case 'scalarAddDc':
                return doMod_scalarAddDc(modInfo, prop)
              case 'maxSize':
                return doMod_maxSize(modInfo)
              case 'scalarMultXp':
                return doMod_scalarMultXp(modInfo)
              default:
                throw new Error(`Unhandled mode: ${modInfo.mode}`)
            }
          }
        })
      }

      properties.forEach((prop) => handleProp(prop))
      // special case for "no property" modifications, i.e. underscore-key'd
      if (!properties.length) handleProp()
    }

    // apply mods
    if (copyMeta._mod) {
      // pre-convert any dynamic text
      Object.entries(copyMeta._mod).forEach(([k, v]) => {
        copyMeta._mod[k] = JSON.parse(
          JSON.stringify(v).replace(/<\$([^$]+)\$>/g, (...m) => {
            const parts = m[1].split('__')

            switch (parts[0]) {
              case 'name':
                return copyTo.name
              case 'short_name':
              case 'title_name': {
                return copyTo.isNpc
                  ? copyTo.name.split(' ')[0]
                  : `${parts[0] === 'title_name' ? 'The ' : 'the '}${copyTo.name.toLowerCase()}`
              }
              case 'spell_dc': {
                // Parser.ABIL_ABVS
                if (!SYSTEM._.ABILITIES.LIST_ABBREVIATIONS.includes(parts[1]))
                  throw new Error(`Unknown ability score "${parts[1]}"`)
                // Parser.getAbilityModNumber
                return 8 + SYSTEM.modifier(Number(copyTo[parts[1]])) + SYSTEM.CR.toProficiencyBonus(copyTo.cr)
              }
              case 'to_hit': {
                if (!SYSTEM._.ABILITIES.LIST_ABBREVIATIONS.includes(parts[1]))
                  throw new Error(`Unknown ability score "${parts[1]}"`)
                const total = SYSTEM.CR.toProficiencyBonus(copyTo.cr) + SYSTEM.modifier(Number(copyTo[parts[1]]))
                return total >= 0 ? `+${total}` : total
              }
              case 'damage_mod': {
                if (!SYSTEM._.ABILITIES.LIST_ABBREVIATIONS.includes(parts[1]))
                  throw new Error(`Unknown ability score "${parts[1]}"`)
                const total = SYSTEM.modifier(Number(copyTo[parts[1]]))
                return total === 0 ? '' : total > 0 ? ` +${total}` : ` ${total}`
              }
              case 'damage_avg': {
                const replaced = parts[1].replace(/(str|dex|con|int|wis|cha)/gi, (...m2) =>
                  SYSTEM.modifier(Number(copyTo[m2[0]]))
                )
                const clean = replaced.replace(/[^-+/*0-9.,]+/g, '')
                // eslint-disable-next-line no-eval
                return Math.floor(eval(clean))
              }
              default:
                return m[0]
            }
          })
        )
      })

      Object.entries(copyMeta._mod).forEach(([prop, modInfos]) => {
        if (prop === '*') doMod(modInfos, 'action', 'reaction', 'trait', 'legendary', 'variant', 'spellcasting')
        else if (prop === '_') doMod(modInfos)
        else doMod(modInfos, prop)
      })
    }

    // add filter tag
    copyTo._isCopy = true

    // cleanup
    delete copyTo._copy
  }
})()

const monster = (function() {
  const impl = {
    _MERGE_REQUIRES_PRESERVE: {
      legendaryGroup: true,
      environment: true,
      soundClip: true,
      page: true,
      altArt: true,
      otherSources: true,
      variant: true,
      dragonCastingColor: true,
      srd: true
    },
    _mergeCache: {}
  }

  function pMergeCopy(monList, mon, options) {
    return generic._pMergeCopy(impl, PAGES.BESTIARY, monList, mon, options)
  }

  async function pLoadAll() {
    const index = await load(`${BASE_URL}data/bestiary/index.json`)
    const allData = await Promise.all(
      Object.entries(index).map(async ([source, file]) => {
        const data = await load(`${BASE_URL}data/bestiary/${file}`)
        return data.monster.filter((it) => it.source === source)
      })
    )
    return allData.flat()
  }

  return {
    pMergeCopy,
    pLoadAll
  }
})()
