'use babel'

import R from 'ramda'

export default function (q, r, items) {
  const regex = R.path(['regex'], r.tokens[0])

  return {
    offset: q.paginationOffset,
    total: r.total,
    regexpStr: regex && regex.toString(),
    items: r.items
      .slice(q.paginationOffset, q.paginationOffset + q.paginationSize)
      .map(({id}) => {
        const item = items[id]
        item.hrtime = process.hrtime().toString()
        return item
      })
  }
}
