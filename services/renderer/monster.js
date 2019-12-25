import { BASE_URL } from '~/utils/data/constants'
import { load } from '~/utils/data'

export async function pPopulateMetaAndLanguages(options = { meta: true, languages: true }) {
  const meta = {}
  const languages = {}

  const data = await load(`${BASE_URL}data/bestiary/meta.json`)

  if (options.meta) {
    // Convert the legendary Group JSONs into a look-up, i.e. use the name as a JSON property name
    data.legendaryGroup.forEach((lg) => {
      meta[lg.source] = meta[lg.source] || {}
      meta[lg.source][lg.name] = lg
    })
  }

  if (options.languages) Object.keys(data.language).forEach((k) => (languages[k] = data.language[k]))

  return { meta, languages }
}

export default {
  pPopulateMetaAndLanguages
}
