'use babel'

const VISIBLE_PADDING = 2

export function start ({scrollTop, rowHeight}) {
  return (scrollTop / rowHeight) | 0
}

export function limit ({listHeight, rowHeight}) {
  return ((listHeight / rowHeight) | 0) + VISIBLE_PADDING
}
