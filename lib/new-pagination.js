'use babel'

export default function newPagination ({listHeight, rowHeight, scrollTop = 0}) {
  return {
    start: (scrollTop / rowHeight) | 0,
    limit: ((listHeight / rowHeight) | 0) + 2
  }
}
