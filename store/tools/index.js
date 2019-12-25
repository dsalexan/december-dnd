/* eslint-disable no-unused-vars */
import { FLUFF_INDEX, TOOLS_DATA_DIRECTORY } from '../../utils/data/constants'

import { pMultisourceLoad } from '@/services/multisource'
const JSON_SRC_INDEX = 'index.json'

export const state = () => ({})

export const actions = {
  async loadBestiary() {
    const loadedSources = await pMultisourceLoad('/data/bestiary/', 'monster', (args) => console.log('dataFn', args))
    return loadedSources
  }
}
