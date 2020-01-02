import _ from 'lodash'

import { warn } from '../debug'
import { SENSES } from './constants'

export function senseToExplanation(senseType) {
  senseType = senseType.toLowerCase()
  warn('BrewUtil not implemented')
  const BrewUtil = { homebrewMeta: {} }
  const fromBrew = _.get(BrewUtil.homebrewMeta, 'senses', senseType)
  if (fromBrew) return fromBrew
  return SENSES.FULL_TO_EXPLANATION.A(senseType, ['No explanation available.'])
}

export default {
  senseToExplanation
}
