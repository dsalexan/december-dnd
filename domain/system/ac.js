import { render } from '~/services/renderer/render'

export function acToFull(ac) {
  if (typeof ac === 'string') return ac // handle classic format

  let stack = ''
  for (let i = 0; i < ac.length; ++i) {
    const cur = ac[i]
    const nxt = ac[i + 1]

    if (cur.ac) {
      if (i === 0 && cur.braces) stack += '('
      stack += cur.ac
      if (cur.from) stack += ` (${cur.from.map((it) => render(it)).join(', ')})`
      if (cur.condition) stack += ` ${render(cur.condition)}`
      if (cur.braces) stack += ')'
    } else {
      stack += cur
    }

    if (nxt) {
      if (nxt.braces) stack += ' ('
      else stack += ', '
    }
  }

  return stack.trim()
}

export default {
  acToFull
}
