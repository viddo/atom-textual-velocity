'use babel'

/* global emit, process */
import fs from 'fs'
import Path from 'path'
import R from 'ramda'
import Bacon from 'baconjs'
import Sifter from 'sifter'

export default function () {
  const terminate = this.async()
  const msgStream = Bacon.fromEvent(process, 'message')
  const disposeStream = msgStream.filter(R.propEq('type', 'dispose'))
  const queryStream = msgStream.filter(R.propEq('type', 'query')).map(R.prop('query'))
  const newItemsStream = msgStream.filter(R.propEq('type', 'add')).map(R.prop('item'))
  const removedItemsStream = msgStream.filter(R.propEq('type', 'rm')).map(R.prop('path'))

  const itemsProp = Bacon.update(
    [],
    [newItemsStream], (items, item) => items.concat({
      title: Path.basename(item.path),
      content: fs.readFileSync(item.path, 'utf8')
    }),
    [removedItemsStream], (items, path) => items.filter(item => item.path !== path)
  )
  const sifterProp = itemsProp
    .debounce(50) // avoid creating a new sifter too often
    .map(items => new Sifter(items))

  Bacon.combineWith(sifterProp, queryStream, (sifter, q) =>
      sifter.search(q, {
        fields: ['title', 'content'],
        sort: [{field: 'title', direction: 'asc'}]
      })
    )
    .onValue(r => emit('results', r))

  disposeStream.onValue(terminate)
}
