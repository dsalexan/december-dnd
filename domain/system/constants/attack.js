import mapify from './mapify'

export const RAW_FULL = {
  MW: 'Melee Weapon Attack',
  RW: 'Ranged Weapon Attack'
}

export default {
  TYPE_TO_FULL: mapify(RAW_FULL)
}
