// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

/**
 * @param entry Data entry to search for fluff on, e.g. a monster
 * @param prop The fluff index reference prop, e.g. `"monsterFluff"`
 */
export function getPredefinedFluff(entry, prop) {
  if (!entry.fluff) return null

  // const mappedProp = `_${prop}`
  // const mappedPropAppend = `_append${prop.uppercaseFirst()}`
  const fluff = {}

  const assignPropsIfExist = (fromObj, ...props) => {
    props.forEach((prop) => {
      if (fromObj[prop]) fluff[prop] = fromObj[prop]
    })
  }

  assignPropsIfExist(entry.fluff, 'name', 'type', 'entries', 'images')

  // TODO: Brew stuff
  // if (entry.fluff[mappedProp]) {
  //   const fromList = (BrewUtil.homebrew[prop] || []).find(
  //     (it) => it.name === entry.fluff[mappedProp].name && it.source === entry.fluff[mappedProp].source
  //   )
  //   if (fromList) {
  //     assignPropsIfExist(fromList, 'name', 'type', 'entries', 'images')
  //   }
  // }

  // if (entry.fluff[mappedPropAppend]) {
  //   const fromList = (BrewUtil.homebrew[prop] || []).find(
  //     (it) => it.name === entry.fluff[mappedPropAppend].name && it.source === entry.fluff[mappedPropAppend].source
  //   )
  //   if (fromList) {
  //     if (fromList.entries) {
  //       fluff.entries = _.cloneDeep(fluff.entries || [])
  //       fluff.entries.push(..._.cloneDeep(fromList.entries))
  //     }
  //     if (fromList.images) {
  //       fluff.images = _.cloneDeep(fluff.images || [])
  //       fluff.images.push(..._.cloneDeep(fromList.images))
  //     }
  //   }
  // }

  return fluff
}
