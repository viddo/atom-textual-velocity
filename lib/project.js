'use babel'

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import R from 'ramda'
import Path from 'path'
import PathFilter from 'scandal/lib/path-filter'
import Sifter from 'sifter'
import * as atoms from './atom-streams'
import createResults from './create-results'
import DisposableValues from './disposable-values'

export default class Project {

  constructor () {
    const queryBus = new Bacon.Bus()
    const queryProp = queryBus
      .skipDuplicates(
        R.allPass([
          R.eqProps('searchStr'),
          R.eqProps('paginationOffset'),
          R.eqProps('paginationSize')
        ]))
      .toProperty({
        searchStr: '',
        paginationOffset: 0,
        paginationSize: 0
      })

    const openProjectPathStream = atoms.createOpenProjectPathStream()
    const newWatchStream = openProjectPathStream
      .map(path => {
        const w = chokidar.watch(path, {
          persistent: true,
          cwd: path
        })
        w.pathFinder = new PathFilter(path, {
          excludeVcsIgnores: atom.config.get('core.excludeVcsIgnoredPaths'),
          exclusions: atom.config.get('core.ignoredNames'),
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

    const closeProjectPathStream = atoms.createCloseProjectPathStream()

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
      .debounce(50) // avoid spamming on initial scans

    const sifterProp = itemsProp
      .map(items => new Sifter(items))
      .startWith(() => new Sifter([]))

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
      })
    )

    // Public props
    this.readyStream = readyStream
    this.queryBus = queryBus
    this.resultsProp = Bacon.when(
        [queryResultsProp.changes(), queryProp, itemsProp], createResults
      )
      .toProperty({
        searchStr: '',
        paginationOffset: 0,
        total: 0,
        items: [],
        regexp: undefined
      })
  }

  dispose () {
    this._disposableValues.dispose()
    for (let key in this._watchers) {
      this._watchers[key].close()
    }
    this._watchers = null
    this.queryBus.end()
  }
}
