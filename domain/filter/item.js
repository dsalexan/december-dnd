const INACTIVE = Symbol('ITEM_INACTIVE')
const INCLUDE_ENTRY = Symbol('ITEM_INCLUDED')
const EXCLUDE_ENTRY = Symbol('ITEM_EXCLUDED')

export const STATES_PROGRESSION = {
  [INACTIVE]: INCLUDE_ENTRY,
  [INCLUDE_ENTRY]: EXCLUDE_ENTRY,
  [EXCLUDE_ENTRY]: INACTIVE
}

export const STATES = {
  INACTIVE,
  INCLUDE_ENTRY,
  EXCLUDE_ENTRY
}

export default function makeItem(data, { group = 'default', state = INACTIVE } = {}) {
  return {
    data,
    group,
    state
  }
}
