import _ from 'lodash'

import { warn } from '../../utils/debug'
import { SKILLS } from './constants'

export function skillToExplanation(skillType) {
  warn('BrewUtil not implemented')
  const BrewUtil = { homebrewMeta: {} }
  const fromBrew = _.get(BrewUtil.homebrewMeta, 'skills', skillType)
  if (fromBrew) return fromBrew
  return SKILLS.NAME_TO_EXPLANATION.A(skillType)
}

export default {
  skillToExplanation,
  _: SKILLS
}
