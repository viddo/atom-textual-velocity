'use babel'

import R from 'ramda'

export default function (qr, q, items) {
  const regex = R.path(['regex'], qr.tokens[0])

  return {
    searchStr: q.searchStr,
    paginationOffset: q.paginationOffset,
    total: qr.total,
    regexp: regex,
    items: qr.items
      .slice(q.paginationOffset, q.paginationOffset + q.paginationSize)
      .map(({id}) => {
        const item = items[id]
        item.hrtime = process.hrtime().toString()
        return item
      })
  }
}
