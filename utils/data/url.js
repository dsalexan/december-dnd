import { PAGES } from './constants'

export function encodeForHash(toEncode) {
  if (Array.isArray(toEncode)) return toEncode.map((it) => `${it}`.toUrlified()).join('_')
  else return `${toEncode}`.toUrlified()
}

export function hashData(data, curPage) {
  const encoder = HASH_BUILDER[curPage]
  if (!encoder) throw new Error(`No encoder found for page ${curPage}`)
  return encoder(data)
}

export const HASH_BUILDER = {
  [PAGES.BESTIARY]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.SPELLS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.BACKGROUNDS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.ITEMS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.CLASSES]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.CONDITIONS_DISEASES]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.FEATS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.OPT_FEATURES]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.PSIONICS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.RACES]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.REWARDS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.VARIATNRULES]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.ADVENTURE]: (it) => encodeForHash(it.id),
  [PAGES.BOOK]: (it) => encodeForHash(it.id),
  [PAGES.DEITIES]: (it) => encodeForHash([it.name, it.pantheon, it.source]),
  [PAGES.CULTS_BOONS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.OBJECTS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.TRAPS_HAZARDS]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.TABLES]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.VEHICLES]: (it) => encodeForHash([it.name, it.source]),
  [PAGES.ACTIONS]: (it) => encodeForHash([it.name, it.source])
}

export default {
  HASH_BUILDER,
  encodeForHash,
  hashData
}
