export function $(obj) {
  return {
    _render: true,
    ...obj
  }
}

export const BREAKLINE = $({
  model: 'component',
  tag: 'br'
})

export default {
  $,
  BREAKLINE
}
