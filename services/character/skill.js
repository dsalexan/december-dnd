import { sortLower } from '../../utils/sort'
import { render } from '@/services/renderer/render'

export function skillProficienciesToFull(skillProficiencies) {
  function renderSingle(skProf) {
    const keys = Object.keys(skProf).sort(sortLower)

    const ixChoose = keys.indexOf('choose')
    if (~ixChoose) keys.splice(ixChoose, 1)

    const baseStack = []
    keys.filter((k) => skProf[k]).forEach((k) => baseStack.push(render(`{@skill ${k.toTitleCase()}}`)))

    const chooseStack = []
    if (~ixChoose) {
      const chObj = skProf.choose
      if (chObj.from.length === 18) {
        chooseStack.push(`choose any ${!chObj.count || chObj.count === 1 ? 'skill' : chObj.count}`)
      } else {
        chooseStack.push(
          `choose ${chObj.count || 1} from ${chObj.from
            .map((it) => render(`{@skill ${it.toTitleCase()}}`))
            .joinConjunct(', ', ' and ')}`
        )
      }
    }

    const base = baseStack.joinConjunct(', ', ' and ')
    const choose = chooseStack.join('') // this should currently only ever be 1-length

    if (baseStack.length && chooseStack.length) return `${base}; and ${choose}`
    else if (baseStack.length) return base
    else if (chooseStack.length) return choose
    return baseStack
  }

  return skillProficiencies.map(renderSingle).join(' <i>or</i> ')
}

export default {
  skillProficienciesToFull
}
