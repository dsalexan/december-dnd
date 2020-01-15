import SOURCE from '~/domain/system/constants/sources'

export function hasBeenReprinted(shortName, source) {
  return (
    shortName !== undefined &&
    shortName !== null &&
    source !== undefined &&
    source !== null &&
    ((shortName === 'Sun Soul' && source === SOURCE.CODE.SCAG) ||
      (shortName === 'Mastermind' && source === SOURCE.CODE.SCAG) ||
      (shortName === 'Swashbuckler' && source === SOURCE.CODE.SCAG) ||
      (shortName === 'Storm' && source === SOURCE.CODE.SCAG) ||
      (shortName === 'Deep Stalker Conclave' && source === SOURCE.CODE.UATRR))
  )
}

export function isAdventure(source) {
  return SOURCE.LIST_SOURCES_ADVENTURES.has(source)
}

export function isCoreOrSupplement(source) {
  return SOURCE.LIST_SOURCES_CORE_SUPPLEMENTS.has(source)
}

export function isNonstandardSource(source) {
  // TODO: Implement BREW
  // return source != null && !BREW.hasSourceJson(source) && _isNonstandardSourceWiz(source)
  return source != null && _isNonstandardSourceWiz(source)
}

function _isNonstandardSourceWiz(source) {
  return (
    source.startsWith(SOURCE.SOURCE_PREFIX.UA) ||
    source.startsWith(SOURCE.SOURCE_PREFIX.PS) ||
    source.startsWith(SOURCE.SOURCE_PREFIX.AL) ||
    SOURCE.LIST_SOURCES_NON_STANDARD_WOTC.has(source)
  )
}

export function getFilterGroup(source) {
  // TODO: Implement BREW
  // if (BREW.hasSourceJson(source))
  //   return {
  //     key: 'homebrew',
  //     name: 'Homebrew'
  //   }
  if (isNonstandardSource(source))
    return {
      key: 'nonstandard',
      name: 'Non-Stardard Sources'
    }
  else if (isCoreOrSupplement(source))
    return {
      key: 'core',
      name: 'Core/Supplements'
    }
  else if (isAdventure(source))
    return {
      key: 'adventures',
      name: 'Adventures'
    }
  else
    return {
      key: 'others',
      name: 'Others'
    }
}

export function hasSourceFull(source) {
  return !!SOURCE.CODE_TO_FULL.A(source)
}

export function hasSourceAbv(source) {
  return !!SOURCE.CODE_TO_ABBREVIATION.A(source)
}

export function sourceJSONToFull(_source) {
  const source = (_source && _source.source) || _source
  if (hasSourceFull(source)) return SOURCE.CODE_TO_FULL.A(source).replace(/'/g, '\u2019')
  // if (BREW.hasSourceJSON(source)) return BREW.sourceJSONToFull(source).replace(/'/g, '\u2019') // TODO: Implement BREW
  return SOURCE.CODE_TO_FULL.A(source).replace(/'/g, '\u2019')
}

export function sourceJSONToFullCompactPrefix(source) {
  return sourceJSONToFull(source)
    .replace(SOURCE.NAME_PREFIX.UA, SOURCE.NAME_PREFIX_SHORT.UA)
    .replace(SOURCE.NAME_PREFIX.AL, SOURCE.NAME_PREFIX_SHORT.AL)
    .replace(SOURCE.NAME_PREFIX.PS, SOURCE.NAME_PREFIX_SHORT.PS)
}

export function sourceJSONToAbv(_source) {
  const source = (_source && _source.source) || _source
  if (hasSourceAbv(source)) return SOURCE.CODE_TO_ABBREVIATION.A(source)
  // if (BREW.hasSourceJson(source)) return BREW.sourceJSONToAbv(source) // TODO: Implement BREW
  return SOURCE.CODE_TO_ABBREVIATION.A(source)
}

export function sourceJSONToColor(source) {
  return `source${sourceJSONToAbv(source)}`

  // BrewUtil._buildSourceCache()
  // if (BrewUtil._sourceCache[source] && BrewUtil._sourceCache[source].color) {
  //   const validColor = BrewUtil.getValidColor(BrewUtil._sourceCache[source].color)
  //   if (validColor.length) return validColor
  //   return ''
  // } else return ''
}

// export function _buildSourceCache() {
//   function doBuild() {
//     if (BrewUtil.homebrewMeta && BrewUtil.homebrewMeta.sources) {
//       BrewUtil.homebrewMeta.sources.forEach((src) => (BrewUtil._sourceCache[src.json] = { ...src }))
//     }
//   }

//   if (!BrewUtil._sourceCache) {
//     BrewUtil._sourceCache = {}

//     if (!BrewUtil.homebrewMeta) {
//       const temp = StorageUtil.syncGet(HOMEBREW_META_STORAGE) || {}
//       temp.sources = temp.sources || []
//       BrewUtil.homebrewMeta = temp
//       doBuild()
//     } else {
//       doBuild()
//     }
//   }
// }

export default {
  hasBeenReprinted,
  isAdventure,
  isCoreOrSupplement,
  isNonstandardSource,
  getFilterGroup,
  hasSourceFull,
  hasSourceAbv,
  sourceJSONToFull,
  sourceJSONToFullCompactPrefix,
  sourceJSONToAbv,
  sourceJSONToColor
}
