'use babel'

export function start ({scrollTop, rowHeight}) {
  return (scrollTop / rowHeight) | 0
}

export function limit ({listHeight, rowHeight}) {
  return ((listHeight / rowHeight) | 0) + 2
}
