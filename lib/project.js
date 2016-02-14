'use babel'

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import R from 'ramda'
import Path from 'path'
import PathFilter from './path-filter'
import Sifter from 'sifter'
import * as darwin from './darwin'

export default class Project {

  constructor (rootPath) {
    const searchBus = this.searchBus = new Bacon.Bus()
    const searchProp = searchBus
      .skipDuplicates()
      .toProperty('')
    this.newFilePathProp = searchProp.map(str => {
      return Path.join(rootPath, str.trim() === '' ? 'untitled.md' : `${str}.md`)
    })

    const w = this._watch = chokidar.watch(rootPath, {
      ignored: 'node_modules',
      persistent: true,
      cwd: rootPath
    })
    const pathFilter = new PathFilter(rootPath)
    const addFilesStream = this._newChokidarEventStream(w, pathFilter, 'add')
    const changedFileStream = this._newChokidarEventStream(w, pathFilter, 'change').debounce(200)
    const readyStream = Bacon.fromEvent(w, 'ready')
    const removedFilesStream = Bacon.fromEvent(w, 'unlink')

    let tagsStream = Bacon.never()
    if (process.platform === 'darwin') {
      this.darwin = darwin
      tagsStream = Bacon.mergeAll(
          addFilesStream,
          changedFileStream
        )
        .flatMap(({path}) => {
          return Bacon
            .fromNodeCallback(this.darwin.getTags, path)
            .map(([tags]) => {
              return {
                path: path,
                tags: tags.join(' ')
              }
            })
        })
        .filter(R.is(Object))
    }

    const filesProp = this.filesProp = Bacon
      .update(
        [],
        [addFilesStream], (files, d) => {
          files.push(this._newFile(d))
          return files
        },
        [changedFileStream], (files, d) => {
          const file = this._newFile(d)
          return files.map(prev => {
            return prev.path === file.path
              ? file
              : prev
          })
        },
        [removedFilesStream], (files, relPath) => {
          const path = Path.join(rootPath, relPath)
          return files.filter(file => file.path !== path)
        },
        [tagsStream], (files, {path, tags}) => {
          const f = files.find(f => f.path === path)
          if (f) {
            f.tags = tags
          }
          return files
        },
        [readyStream], R.identity
      )
      .debounce(50) // avoid spamming on initial scans

    const sifterProp = filesProp
      .map(files => new Sifter(files))
      .startWith(() => new Sifter([]))

    this.isLoadingFilesProp = readyStream.map(false).toProperty(true)
    this.resultsProp = Bacon
      .combineWith(sifterProp, searchProp, (sifter, searchStr) => {
        // see https://github.com/brianreavis/sifter.js/#searchquery-options
        return sifter.search(searchStr, {
          fields: ['name', 'content', 'tags'],
          sort: [
            {field: 'mtimestamp', direction: 'desc'},
            {field: '$score', direction: 'desc'}
          ],
          conjunction: 'and'
        })
      })
  }

  dispose () {
    this.searchBus.end()
    this._watch.close()
  }

  _newChokidarEventStream (w, pathFilter, event) {
    const rootPath = w.options.cwd
    return Bacon
      .fromEvent(w, event, (relPath, stat) => {
        const path = Path.join(rootPath, relPath)
        if (pathFilter.isFileAccepted(path)) {
          return {
            path: path,
            rootPath: rootPath,
            relPath: relPath,
            stat: stat
          }
        }
      })
      .filter(R.is(Object))
  }

  _newFile (d) {
    const stat = d.stat || fs.statSync(d.path)
    const parsedPath = Path.parse(d.relPath)
    return {
      path: d.path,
      rootPath: d.rootPath,
      relPath: d.relPath,
      name: parsedPath.name,
      ext: parsedPath.ext,
      stat: stat,
      tags: '',
      mtimestamp: stat.mtime.getTime(),
      content: fs.readFileSync(d.path, 'utf8')
    }
  }
}
