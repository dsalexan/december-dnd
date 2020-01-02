import _ from 'lodash'

import mapify from './mapify'

// http://archive.wizards.com/default.asp?x=dnd/rg/20040316a

// LENGHT
export const MILIMETER = 'milimiter'
export const CENTIMETER = 'centimeter'
export const METER = 'meter'
export const KILOMETER = 'kilometer'

export const INCH = 'inch' // polegada
export const FOOT = 'foot' // pé
export const YARD = 'yard' // jarda
export const MILE = 'mile' // milhas
export const LEAGUE = 'league' // ligas? 1 league = 3 miles

// AREA
export const HECTAR = 'hectar' // hectare
export const ACRE = 'acre' // acre

// VOLUME
export const MILILITER = 'militer'
export const LITER = 'liter'

export const FLUID_OUNCE = 'fluid_ounce'
export const PINT = 'pint'
export const QUART = 'quart'
export const GALLON = 'gallon'

// WEIGHT
export const GRAM = 'gram'
export const KILOGRAM = 'kilogram'
export const METRIC_TON = 'metric_ton'

export const OUNCE = 'ounce'
export const POUND = 'pound'
export const TON = 'ton'

// export const RAW_CONVERSIONS = {
//   [MILILITER]: {
//     [METER]: 1 / 1000,
//     [INCH]: 1 / 25.4
//   },
//   [CENTIMETER]: {
//     [METER]: 1 / 100,
//     [INCH]: 1 / 2.54
//   },
//   [METER]: {
//     [METER]: 1,
//     [FOOT]: 2 / 5,
//     [YARD]: 1 / 0.914
//   },
//   [KILOMETER]: {
//     [METER]: 1000,
//     [MILE]: 1 / 1.61,
//     [LEAGUE]: 1 / 4.83
//   },

//   [INCH]: {
//     [FOOT]:
//   }
// }

// export const RAW_TACTICAL_CONVERSIONS = {
//   [METER]: {
//     [FOOT]: 2 / 5
//   }
// }

export const RAW_TACTICAL_CONVERSIONS = {
  [METER]: {
    [FOOT]: 5 / 2
  },
  [FOOT]: {
    [METER]: 2 / 5
  }
}

export const RAW_NAMES = {
  [INCH]: [INCH, 'inches'],
  [FOOT]: [FOOT, 'feet']
}

export const RAW_ABBREVIATIONS = {
  [INCH]: ['in', 'inch'],
  [FOOT]: ['ft']
}

export default {
  UNIT_TO_ABBREVIATION: mapify(RAW_ABBREVIATIONS),
  UNIT_TO_NAMES: mapify(
    _.mergeWith(RAW_NAMES, RAW_ABBREVIATIONS, (objValue, srcValue) => {
      if (_.isArray(objValue) && _.isArray(srcValue)) {
        return [...objValue, ...srcValue]
      }
    })
  )
}
