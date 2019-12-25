import { makeFilter } from './factory'

export default function() {
  const sourceFilter = makeFilter({
    header: 'Source',
    defaults: []
    // displayFn: ()
  })

  return {
    filters: {
      source: sourceFilter
    }
  }
}
