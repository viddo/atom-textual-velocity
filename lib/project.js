'use babel'

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import R from 'ramda'
import Path from 'path'
import PathFilter from './path-filter'
import Sifter from 'sifter'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'

export default class Project {

  constructor () {
    const searchBus = this.searchBus = new Bacon.Bus()
    const searchProp = searchBus
      .skipDuplicates()
      .toProperty('')

    const newWatchStream = atoms.createOpenProjectPathStream()
      .map(path => {
        const w = chokidar.watch(path, {
          ignored: 'node_modules',
          persistent: true,
          cwd: path
        })
        w.pathFilter = new PathFilter(path)
        return w
      })
    const chokidarEventStream = (w, event) => {
      const projectPath = w.options.cwd
      return Bacon
        .fromEvent(w, event, (relPath, stat) => {
          const path = Path.join(projectPath, relPath)
          if (w.pathFilter.isFileAccepted(path)) {
            return {
              path: path,
              projectPath: projectPath,
              relPath: relPath,
              stat: stat
            }
          }
        })
        .filter(R.is(Object))
    }
    const addFilesStream = newWatchStream.flatMap(w => chokidarEventStream(w, 'add'))
    const changedFileStream = newWatchStream.flatMap(w => chokidarEventStream(w, 'change').debounce(200))
    const readyStream = newWatchStream.flatMap(w => {
      return Bacon.fromEvent(w, 'ready', () => w.options.cwd)
    })
    const removedFilesStream = newWatchStream.flatMap(w => {
      return Bacon.fromEvent(w, 'unlink', relPath => {
        return {
          projectPath: w.options.cwd,
          relPath: relPath
        }
      })
    })

    const closeProjectPathStream = atoms.createCloseProjectPathStream()

    const newFile = d => {
      const stat = d.stat || fs.statSync(d.path)
      const parsedPath = Path.parse(d.relPath)
      return {
        path: d.path,
        projectPath: d.projectPath,
        relPath: d.relPath,
        name: parsedPath.name,
        ext: parsedPath.ext,
        stat: stat,
        mtimestamp: stat.mtime.getTime(),
        content: fs.readFileSync(d.path, 'utf8')
      }
    }
    const filesProp = this.filesProp = Bacon
      .update(
        [],
        [addFilesStream], (files, d) => {
          files.push(newFile(d))
          return files
        },
        [changedFileStream], (files, d) => {
          const file = newFile(d)
          return files.map(prev => {
            return prev.path === file.path
              ? file
              : prev
          })
        },
        [removedFilesStream], (files, {projectPath, relPath}) => {
          const path = Path.join(projectPath, relPath)
          return files.filter(file => file.path !== path)
        },
        [closeProjectPathStream], (files, projectPath) =>
          files.filter(file => file.projectPath !== projectPath),
        [readyStream], R.identity
      )
      .debounce(50) // avoid spamming on initial scans

    const sifterProp = filesProp
      .map(files => new Sifter(files))
      .startWith(() => new Sifter([]))

    this.openProjectPathStream = newWatchStream
    this.parsedprojectPathStream = readyStream
    this.resultsProp = Bacon
      .combineWith(sifterProp, searchProp, (sifter, searchStr) => {
        // see https://github.com/brianreavis/sifter.js/#searchquery-options
        return sifter.search(searchStr, {
          fields: ['name', 'content'],
          sort: [
            {field: 'mtimestamp', direction: 'desc'},
            {field: '$score', direction: 'desc'}
          ],
          conjunction: 'and'
        })
      })

    // Side-effects
    this._watchers = {}
    this._disposables = new DisposableValues()
    this._disposables.add(
      newWatchStream.onValue(w => {
        this._watchers[w.options.cwd] = w
      }))
    this._disposables.add(
      closeProjectPathStream.onValue(projectPath => {
        this._watchers[projectPath].close()
      }))
  }

  dispose () {
    this._disposables.dispose()
    for (let key in this._watchers) {
      this._watchers[key].close()
    }
    this._watchers = null
    this.searchBus.end()
  }
}
