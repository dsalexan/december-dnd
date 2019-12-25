export function abbreviationToFull(alignment) {
  if (!alignment) return null // used in sidekicks
  if (typeof alignment === 'object') {
    if (alignment.special != null) {
      // use in MTF Sacred Statue
      return alignment.special
    } else {
      // e.g. `{alignment: ["N", "G"], chance: 50}` or `{alignment: ["N", "G"]}`
      return `${alignment.alignment.map((a) => abbreviationToFull(a)).join(' ')}${
        alignment.chance ? ` (${alignment.chance}%)` : ''
      }`
    }
  } else {
    alignment = alignment.toUpperCase()
    switch (alignment) {
      case 'L':
        return 'Lawful'
      case 'N':
        return 'Neutral'
      case 'NX':
        return 'Neutral (Law/Chaos axis)'
      case 'NY':
        return 'Neutral (Good/Evil axis)'
      case 'C':
        return 'Chaotic'
      case 'G':
        return 'Good'
      case 'E':
        return 'Evil'
      // "special" values
      case 'U':
        return 'Unaligned'
      case 'A':
        return 'Any alignment'
    }
    return alignment
  }
}

export function listToFull(alignList) {
  if (alignList.some((it) => typeof it !== 'string')) {
    if (alignList.some((it) => typeof it === 'string')) throw new Error(`Mixed alignment types: ${JSON.stringify(alignList)}`)
    // filter out any nonexistent alignments, as we don't care about "alignment does not exist" if there are other alignments
    alignList = alignList.filter((it) => it.alignment === undefined || it.alignment != null)
    return alignList
      .map((it) => (it.special != null || it.chance != null ? abbreviationToFull(it) : listToFull(it.alignment)))
      .join(' or ')
  } else {
    // assume all single-length arrays can be simply parsed
    if (alignList.length === 1) return abbreviationToFull(alignList[0])
    // a pair of abv's, e.g. "L" "G"
    if (alignList.length === 2) {
      return alignList.map((a) => abbreviationToFull(a)).join(' ')
    }
    if (alignList.length === 3) {
      if (alignList.includes('NX') && alignList.includes('NY') && alignList.includes('N')) return 'Any Neutral Alignment'
    }
    // longer arrays should have a custom mapping
    if (alignList.length === 5) {
      if (!alignList.includes('G')) return 'Any Non-Good Alignment'
      if (!alignList.includes('E')) return 'Any Non-Evil Alignment'
      if (!alignList.includes('L')) return 'Any Non-Lawful Alignment'
      if (!alignList.includes('C')) return 'Any Non-Chaotic Alignment'
    }
    if (alignList.length === 4) {
      if (!alignList.includes('L') && !alignList.includes('NX')) return 'Any Chaotic Alignment'
      if (!alignList.includes('G') && !alignList.includes('NY')) return 'Any Evil Alignment'
      if (!alignList.includes('C') && !alignList.includes('NX')) return 'Any Lawful Alignment'
      if (!alignList.includes('E') && !alignList.includes('NY')) return 'Any Good Alignment'
    }
    throw new Error(`Unmapped alignment: ${JSON.stringify(alignList)}`)
  }
}

export default {
  abbreviationToFull,
  listToFull
}
