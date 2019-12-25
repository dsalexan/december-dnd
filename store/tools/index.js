/* eslint-disable no-unused-vars */
import { FLUFF_INDEX, TOOLS_DATA_DIRECTORY } from '../../utils/data/constants'

import { pMultisourceLoad } from '@/services/multisource'
import { pPopulateMetaAndLanguages } from '~/services/renderer/monster'
const JSON_SRC_INDEX = 'index.json'

export const state = () => ({})

export const actions = {
  async loadBestiary() {
    const multisourceLoad = pMultisourceLoad('/data/bestiary/', 'monster', (args) => console.log('dataFn', args))
    const metaAndLanguagesLoad = pPopulateMetaAndLanguages()

    await Promise.all([multisourceLoad, metaAndLanguagesLoad])

    return {
      loadedSources: await multisourceLoad,
      ...(await metaAndLanguagesLoad)
    }
  }
}
