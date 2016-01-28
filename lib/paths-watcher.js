'use babel'

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import R from 'ramda'
import Path from 'path'
import PathFilter from 'scandal/lib/path-filter'
import Sifter from 'sifter'
import createResults from './create-results'
import DisposableValues from './disposable-values'

export default class PathsWatcher {

  constructor (opts) {
    const openProjectPathStream = opts.openProjectPathStream
    const closeProjectPathStream = opts.closeProjectPathStream
    const paginateLastQueryStream = opts.paginateLastQueryStream
    const queryProp = opts.queryStream.toProperty({ searchStr: '' })

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
      return Bacon.fromEvent(w, 'ready', () => w.options.cwd)
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
          items.push({
            projectPath: item.projectPath,
            relPath: item.relPath,
            dirPath: parsedPath.dir,
            basename: parsedPath.base,
            ext: parsedPath.ext,
            stat: stat,
            mtimestamp: stat.mtime.getTime(),
            content: fs.readFileSync(fullPath, 'utf8')
          })
          return items
        },
        [removedItemsStream], (items, {projectPath, relPath}) =>
          items.filter(item => item.relPath !== relPath || item.projectPath !== projectPath),
        [closeProjectPathStream], (items, projectPath) =>
          items.filter(item => item.projectPath !== projectPath),
        [readyStream], R.identity
      )
      .debounce(100) // make sure to not spam prop changes until changes calms down (e.g. initial scan)

    const sifterProp = itemsProp
      .map(items => {
        return new Sifter(items)
      })
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

    this._watchers = {}
    this._disposableValues = new DisposableValues(
      newWatchStream.onValue(w => {
        this._watchers[w.options.cwd] = w
      }),
      closeProjectPathStream.onValue(projectPath => {
        this._watchers[projectPath].close()
      }),
    )

    this.resultsStream = Bacon.when(
      [queryResultsProp.changes(), queryProp, itemsProp], R.flip(createResults),
      [paginateLastQueryStream, queryResultsProp, itemsProp], createResults
    )

    this.readyStream = readyStream
  }

  dispose () {
    this._disposableValues.dispose()
    for (let key in this._watchers) {
      this._watchers[key].close()
    }
    this._watchers = null
  }
}
