function _splitByTagsBase(leadingCharacter) {
  return function(string) {
    let tagDepth = 0
    let char, char2
    const out = []
    let curStr = ''
    let isLastOpen = false

    const len = string.length
    for (let i = 0; i < len; ++i) {
      char = string[i]
      char2 = string[i + 1]

      switch (char) {
        case '{':
          isLastOpen = true
          if (char2 === leadingCharacter) {
            if (tagDepth++ > 0) {
              curStr += '{'
            } else {
              out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter))
              curStr = leadingCharacter
              ++i
            }
          } else curStr += '{'
          break

        case '}':
          isLastOpen = false
          if (tagDepth === 0) {
            curStr += '}'
          } else if (--tagDepth === 0) {
            out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter))
            curStr = ''
          } else curStr += '}'
          break

        case leadingCharacter: {
          if (!isLastOpen) curStr += '<VE_LEAD>'
          else curStr += leadingCharacter
          break
        }

        default:
          isLastOpen = false
          curStr += char
          break
      }
    }

    if (curStr) out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter))

    return out
  }
}

export const splitByTags = _splitByTagsBase('@')
export const splitByPropertyInjectors = _splitByTagsBase('=')

export function splitFirstSpace(string) {
  const firstIndex = string.indexOf(' ')
  return firstIndex === -1 ? [string, ''] : [string.substr(0, firstIndex), string.substr(firstIndex + 1)]
}

export function attackTagToFull(tagStr) {
  function renderTag(tags) {
    return `${
      tags.includes('m')
        ? 'Melee '
        : tags.includes('r')
        ? 'Ranged '
        : tags.includes('g')
        ? 'Magical '
        : tags.includes('a')
        ? 'Area '
        : ''
    }${tags.includes('w') ? 'Weapon ' : tags.includes('s') ? 'Spell ' : ''}`
  }

  const tagGroups = tagStr
    .toLowerCase()
    .split(',')
    .map((it) => it.trim())
    .filter((it) => it)
    .map((it) => it.split(''))
  if (tagGroups.length > 1) {
    const seen = new Set(tagGroups.last())
    for (let i = tagGroups.length - 2; i >= 0; --i) {
      tagGroups[i] = tagGroups[i].filter((it) => {
        const out = !seen.has(it)
        seen.add(it)
        return out
      })
    }
  }
  return `${tagGroups.map((it) => renderTag(it)).join(' or ')}Attack:`
}

export default {
  splitByTags,
  splitByPropertyInjectors,
  splitFirstSpace,
  attackTagToFull
}
