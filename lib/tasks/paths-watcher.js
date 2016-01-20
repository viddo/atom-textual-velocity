'use babel'
/* global process, emit */

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import R from 'ramda'
import PathFilter from 'scandal/lib/path-filter'
import Sifter from 'sifter'
import DisposableValues from '../disposable-values'
import getResult from './get-result'
import receiveMessagesFrom from './receive-messages-from'

export default function (projectPaths, ignoredNames, excludeVcsIgnores) {
  const terminate = this.async()
  const messageReceiver = receiveMessagesFrom(process)
  const closeProjectPathStream = messageReceiver.createStream('closeProjectPath')

  const filterOpts = {
    excludeVcsIgnores: true,
    exclusions: ignoredNames,
    inclusions: ['*.md', '*.txt']
  }
  const pathFiltersProp = Bacon.update(
    projectPaths.map(path => new PathFilter(path, filterOpts)),
    [closeProjectPathStream], (pathFilters, path) => pathFilters.filter(pf => pf.rootPath !== path)
  )

  const watcher = chokidar.watch(projectPaths, {
    persistent: true
  })
  const readyStream = Bacon.fromEvent(watcher, 'ready')
  const addItemsStream = Bacon.fromEvent(watcher, 'add', (path, stat) => {
    return {
      path: path,
      stat: stat
    }
  })
  const removedItemsStream = Bacon.fromEvent(watcher, 'unlink')
  const itemsProp = Bacon.update(
      [],
      [addItemsStream, pathFiltersProp], (items, item, pathFilters) => {
        const path = item.path
        const pf = pathFilters.find(pf => path.startsWith(pf.rootPath))
        if (pf && pf.isFileAccepted(path)) {
          const stat = item.stat || fs.statSync(path)
          return items.concat({
            path: path,
            mtimestamp: stat.mtime.getTime(),
            stat: stat,
            content: fs.readFileSync(path, 'utf8')
          })
        } else {
          return items
        }
      },
      [removedItemsStream], (items, path) => items.filter(item => item.path !== path),
      [closeProjectPathStream], (items, path) => items.filter(item => !item.path.startsWith(path)),
      [readyStream], (items) => items
    )
    .debounce(100) // make sure to not spam prop changes until changes calms down (e.g. initial scan)

  const sifterProp = itemsProp
    .map(items => new Sifter(items))
    .startWith(new Sifter([]))
  const queryProp = messageReceiver.createStream('query').toProperty({ searchStr: '' })
  const queryResultsProp = Bacon.combineWith(sifterProp, queryProp, (sifter, {searchStr}) => {
    // see https://github.com/brianreavis/sifter.js/#searchquery-options
    return sifter.search(searchStr, {
      fields: ['path', 'content'],
      sort: [
        {field: 'mtimestamp', direction: 'desc'},
        {field: '$score', direction: 'desc'}
      ],
      conjunction: 'and'
    })
  })

  const resultsStream = Bacon.when(
    [queryResultsProp.changes(), queryProp, itemsProp], R.flip(getResult),
    [messageReceiver.createStream('paginateLastQuery'), queryResultsProp, itemsProp], getResult
  )

  const disposableValues = new DisposableValues(
    resultsStream.onValue(r => emit('results', r)),
    closeProjectPathStream.onValue(path => watcher.unwatch(path))
  )

  messageReceiver.createStream('dispose').onValue(() => {
    watcher.close()
    disposableValues.dispose()
    terminate()
  })
}
