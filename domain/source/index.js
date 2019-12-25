import {
  CODE,
  LIST_SOURCES_ADVENTURES,
  LIST_SOURCES_CORE_SUPPLEMENTS,
  LIST_SOURCES_NON_STANDARD_WOTC,
  SOURCE_PREFIX
} from '@/utils/system/constants/sources'

export function hasBeenReprinted(shortName, source) {
  return (
    shortName !== undefined &&
    shortName !== null &&
    source !== undefined &&
    source !== null &&
    ((shortName === 'Sun Soul' && source === CODE.SCAG) ||
      (shortName === 'Mastermind' && source === CODE.SCAG) ||
      (shortName === 'Swashbuckler' && source === CODE.SCAG) ||
      (shortName === 'Storm' && source === CODE.SCAG) ||
      (shortName === 'Deep Stalker Conclave' && source === CODE.UATRR))
  )
}

export function isAdventure(source) {
  return LIST_SOURCES_ADVENTURES.has(source)
}

export function isCoreOrSupplement(source) {
  return LIST_SOURCES_CORE_SUPPLEMENTS.has(source)
}

export function isNonstandardSource(source) {
  // TODO: Implement BREWUTIL
  // return source != null && !BrewUtil.hasSourceJson(source) && _isNonstandardSourceWiz(source)
  return source != null && _isNonstandardSourceWiz(source)
}

function _isNonstandardSourceWiz(source) {
  return (
    source.startsWith(SOURCE_PREFIX.UA) ||
    source.startsWith(SOURCE_PREFIX.PS) ||
    source.startsWith(SOURCE_PREFIX.AL) ||
    LIST_SOURCES_NON_STANDARD_WOTC.has(source)
  )
}

export function getFilterGroup(source) {
  // TODO: Implement BREWUTIL
  // if (BrewUtil.hasSourceJson(source)) return 2
  return Number(isNonstandardSource(source))
}

export default {
  hasBeenReprinted,
  isAdventure,
  isCoreOrSupplement,
  isNonstandardSource,
  getFilterGroup
}
