import { ABILITIES } from './constants'

export function attrChooseToFull(attList) {
  if (attList.length === 1) return `${ABILITIES.ABBREVIATIONS_TO_FULL.A(attList[0])} modifier`
  else {
    const attsTemp = []
    for (let i = 0; i < attList.length; ++i) {
      attsTemp.push(ABILITIES.ABBREVIATIONS_TO_FULL.A(attList[i]))
    }
    return `${attsTemp.join(' or ')} modifier (your choice)`
  }
}

export default {
  attrChooseToFull,
  _: ABILITIES
}
