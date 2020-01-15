/* 1eslint-disable no-undef */
/* 1eslint-disable no-unused-vars */
import * as DATA from '@/utils/data'
import { isNonstandardSource } from '~/domain/source'

const JSON_SRC_INDEX = 'index.json'

/**
 * @param jsonDir the directory containing JSON for this page
 * @param jsonListName the name of the root JSON property for the list of data
 * @param pPageInit promise to be run once the index has loaded, should accept an object of src:URL mappings
 * @param dataFn function to be run when all data has been loaded, should accept a list of objects custom to the page
 * @param pDone optional promise to be run after dataFn, but before page history/etc is init'd
 * (e.g. spell data objects for the spell page) which were found in the `jsonListName` list
 */
export async function pMultisourceLoad(jsonDir, jsonListName, dataFn, pDone) {
  const index = await DATA.load(jsonDir + JSON_SRC_INDEX)
  const loadedSources = _pOnIndexLoad(index, jsonDir, jsonListName, dataFn, pDone)
  return loadedSources
  // pPageInit(loadedSources)
}

async function _pOnIndexLoad(src2UrlMap, jsonDir, dataProp, addFn, pDone) {
  // track loaded sources
  const loadedSources = {}
  Object.keys(src2UrlMap).forEach((src) => (loadedSources[src] = { url: jsonDir + src2UrlMap[src], loaded: false }))

  // collect a list of sources to load
  const sources = Object.keys(src2UrlMap)
  const defaultSel = sources.filter((s) => !isNonstandardSource(s))

  // const hashSourceRaw = Hist.getHashSource() // TODO: This has something to do with "#" in query url?
  // const hashSourceRaw = null
  // eslint-disable-next-line max-len
  // const hashSource = hashSourceRaw ? Object.keys(src2UrlMap).find((it) => it.toLowerCase() === hashSourceRaw.toLowerCase()) : null

  // const userSel = [
  //   ...new Set(
  //     [] // TODO: Store last filter
  //       .concat([]) // TODO: Store selected sources?
  //       .concat(hashSource ? [hashSource] : [])
  //   )
  // ]

  const allSources = []

  // add any sources from the user's saved filters, provided they have URLs and haven't already been added
  // if (userSel) {
  //   userSel
  //     .filter((src) => src2UrlMap[src])
  //     .filter((src) => $.inArray(src, allSources) === -1)
  //     .forEach((src) => allSources.push(src))
  // }

  // if there's no saved filters, load the defaults
  if (allSources.length === 0) {
    // remove any sources that don't have URLs
    defaultSel.filter((src) => src2UrlMap[src]).forEach((src) => allSources.push(src))
  }

  // add source from the current hash, if there is one
  // if (window.location.hash.length) {
  //   const [link, ...sub] = Hist._getHashParts()
  //   const src = link.split('_')[1]
  //   const hashSrcs = {}
  //   sources.forEach((src) => (hashSrcs[encodeForHash(src)] = src))
  //   const mapped = hashSrcs[src]
  //   if (mapped && !allSources.includes(mapped)) {
  //     allSources.push(mapped)
  //   }
  // }

  // make a list of src : url objects
  const toLoads = allSources.map((src) => ({ src, url: jsonDir + src2UrlMap[src] }))

  // load the sources
  if (toLoads.length > 0) {
    const dataStack = (
      await Promise.all(
        toLoads.map(async (toLoad) => {
          const data = await DATA.load(toLoad.url)
          loadedSources[toLoad.src].loaded = true
          return data
        })
      )
    ).flat()

    let toAdd = []
    dataStack.forEach((d) => (toAdd = toAdd.concat(d[dataProp])))
    addFn(toAdd)
  }

  return loadedSources

  // RollerUtil.addListRollButton()
  // ListUtil.addListShowHide()

  // list.init()
  // subList.init()

  // Hist.init(true)
}

// eslint-disable-next-line no-unused-vars
export function makeLoadSource(loadedSources, jsonListName, dataFn) {
  return function(src, val) {
    const toLoad = loadedSources[src] || loadedSources[Object.keys(loadedSources).find((k) => k.toLowerCase() === src)]
    if (!toLoad.loaded && val === 'yes') {
      DATA.load(toLoad.url).then(function(data) {
        dataFn(data[jsonListName])
        toLoad.loaded = true
      })
    }
  }
}

// eslint-disable-next-line no-unused-vars
function onFilterChangeMulti(multiList) {
  throw new Error('Unimplemented')
  // FilterBox.selectFirstVisible(multiList)
}

// function pPageInit(loadedSources) {
//   Object.keys(loadedSources)
//     .map((src) => new FilterItem({ item: src, changeFn: loadSource(JSON_LIST_NAME, addMonsters) }))
//     .forEach((fi) => bestiaryPage._pageFilter.sourceFilter.addItem(fi))
// }
