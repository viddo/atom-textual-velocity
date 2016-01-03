'use babel'
/* global process, emit */

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import PathFilter from 'scandal/lib/path-filter'
import Sifter from 'sifter'
import DisposableValues from './disposable-values'
import receiveMessagesFrom from './task/receive-messages-from'

export default function (projectPaths, ignoredNames, excludeVcsIgnores) {
  const terminate = this.async()
  const messageReceiver = receiveMessagesFrom(process)
  const queryStream = messageReceiver.createStream('query')
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
  const addItemsStream = Bacon.fromEvent(watcher, 'add')
  const removedItemsStream = Bacon.fromEvent(watcher, 'unlink')
  const itemsProp = Bacon.update(
    [],
    [addItemsStream, pathFiltersProp], (items, path, pathFilters) => {
      const pf = pathFilters.find(pf => path.startsWith(pf.rootPath))
      if (pf && pf.isFileAccepted(path)) {
        emit('addedItem', {
          path: path,
          stat: fs.statSync(path)
        })
        return items.concat({
          path: path,
          content: fs.readFileSync(path, 'utf8')
        })
      } else {
        return items
      }
    },
    [removedItemsStream], (items, path) => items.filter(item => {
      if (item.path === path) {
        emit('removedItem', path)
      } else {
        return true
      }
    }),
    [closeProjectPathStream], (items, path) => items.filter(item => {
      if (item.path.startsWith(path)) {
        emit('removedItem', path)
      } else {
        return true
      }
    })
  )
  const sifterProp = itemsProp
    .debounce(50) // avoid creating a new sifter too often
    .map(items => new Sifter(items))

  const queryResultsProp = Bacon.combineWith(sifterProp, queryStream, (sifter, q) =>
    sifter.search(q, {
      fields: ['path', 'content'],
      sort: [{field: 'path', direction: 'asc'}]
    })
  )

  const disposableValues = new DisposableValues(
    queryResultsProp.onValue(r => emit('queryResults', r)),
    closeProjectPathStream.onValue(path => watcher.unwatch(path))
  )

  messageReceiver.createStream('dispose').onValue(() => {
    watcher.close()
    disposableValues.dispose()
    terminate()
  })
}
