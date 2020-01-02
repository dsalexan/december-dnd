/* eslint-disable max-len */
import mapify from './mapify'

export const LIST_ABBREVIATIONS = ['B', 'D', 'SD', 'T', 'U']

export const RAW_FULL_NAMES = {
  B: 'blindsight',
  D: 'darkvision',
  SD: 'superior darkvision',
  T: 'tremorsense',
  U: 'truesight'
}

export const RAW_EXPLANATIONS = {
  blindsight: [
    'A creature with blindsight can perceive its surroundings without relying on sight, within a specific radius. Creatures without eyes, such as oozes, and creatures with echolocation or heightened senses, such as bats and true dragons, have this sense.'
  ],
  darkvision: [
    "Many creatures in fantasy gaming worlds, especially those that dwell underground, have darkvision. Within a specified range, a creature with darkvision can see in dim light as if it were bright light and in darkness as if it were dim light, so areas of darkness are only lightly obscured as far as that creature is concerned. However, the creature can't discern color in that darkness, only shades of gray."
  ],
  tremorsense: [
    "A creature with tremorsense can detect and pinpoint the origin of vibrations within a specific radius, provided that the creature and the source of the vibrations are in contact with the same ground or substance. Tremorsense can't be used to detect flying or incorporeal creatures. Many burrowing creatures, such as ankhegs and umber hulks, have this special sense."
  ],
  truesight: [
    'A creature with truesight can, out to a specific range, see in normal and magical darkness, see invisible creatures and objects, automatically detect visual illusions and succeed on saving throws against them, and perceives the original form of a shapechanger or a creature that is transformed by magic. Furthermore, the creature can see into the Ethereal Plane.'
  ]
}

export default {
  ABBREVIATION_TO_FULL: mapify(RAW_FULL_NAMES),
  FULL_TO_EXPLANATION: mapify(RAW_EXPLANATIONS),
  LIST_ABBREVIATIONS
}
