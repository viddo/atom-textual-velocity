'use babel'
/* global process, emit */

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import R from 'ramda'
import Path from 'path'
import PathFilter from 'scandal/lib/path-filter'
import Sifter from 'sifter'
import DisposableValues from '../disposable-values'
import createResults from './create-results'
import receiveMessagesFrom from './receive-messages-from'

export default function (projectPaths, ignoredNames, excludeVcsIgnores) {
  const terminate = this.async()
  const messageReceiver = receiveMessagesFrom(process)
  const disposeStream = messageReceiver.createStream('dispose')
  const openProjectPathStream = messageReceiver.createStream('openProjectPath')
  const closeProjectPathStream = messageReceiver.createStream('closeProjectPath')

  const newWatchStream = openProjectPathStream.map(p => {
    const w = chokidar.watch(p.path, {
      persistent: true,
      cwd: p.path
    })
    w.pathFinder = new PathFilter(p.path, {
      excludeVcsIgnores: p.excludeVcsIgnoredPaths,
      exclusions: p.ignoredNames,
      inclusions: ['*.md', '*.txt']
    })
    return w
  })
  const addItemsStream = newWatchStream.flatMap(w => {
    const projectPath = w.options.cwd
    return Bacon
      .fromEvent(w, 'add', (relPath, stat) => {
        if (w.pathFinder.isFileAccepted(Path.join(projectPath, relPath))) {
          return {
            projectPath: projectPath,
            relPath: relPath,
            stat: stat
          }
        }
      })
      .filter(R.identity)
  })
  const readyStream = newWatchStream.flatMap(w => {
    return Bacon.fromEvent(w, 'ready')
  })
  const removedItemsStream = newWatchStream.flatMap(w => {
    return Bacon.fromEvent(w, 'unlink', relPath => {
      return {
        projectPath: w.options.cwd,
        relPath: relPath
      }
    })
  })

  const itemsProp = Bacon.update(
      [],
      [addItemsStream], (items, item) => {
        const fullPath = Path.join(item.projectPath, item.relPath)
        const parsedPath = Path.parse(item.relPath)
        const stat = item.stat || fs.statSync(fullPath)
        return items.concat({
          projectPath: item.projectPath,
          relPath: item.relPath,
          dirPath: parsedPath.dir,
          basename: parsedPath.base,
          ext: parsedPath.ext,
          stat: stat,
          mtimestamp: stat.mtime.getTime(),
          content: fs.readFileSync(fullPath, 'utf8')
        })
      },
      [removedItemsStream], (items, {projectPath, relPath}) =>
        items.filter(item => item.relPath === relPath && item.projectPath === projectPath),
      [closeProjectPathStream], (items, projectPath) =>
        items.filter(item => item.projectPath !== projectPath),
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
      fields: ['basename', 'content'],
      sort: [
        {field: 'mtimestamp', direction: 'desc'},
        {field: '$score', direction: 'desc'}
      ],
      conjunction: 'and'
    })
  })

  const resultsStream = Bacon.when(
    [queryResultsProp.changes(), queryProp, itemsProp], R.flip(createResults),
    [messageReceiver.createStream('paginateLastQuery'), queryResultsProp, itemsProp], createResults
  )

  const disposableValues = new DisposableValues(
    resultsStream.onValue(r => emit('results', r)),
    Bacon.update(
      {},
      [newWatchStream], (watchers, w) => {
        watchers[w.options.cwd] = w
        return watchers
      },
      [closeProjectPathStream], (watchers, projectPath) => {
        watchers[projectPath].close()
        return watchers
      },
      [disposeStream], (watchers) => {
        for (let projectPath in watchers) {
          watchers[projectPath].close()
        }
        disposableValues.dispose()
        terminate()
      }
    ).onValue(() => {})
  )
}
