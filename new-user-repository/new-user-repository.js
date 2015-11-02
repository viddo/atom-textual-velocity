'use babel'

import path from 'path'
import fs from 'fs'
import {Emitter} from 'atom'
import {PathSearcher, PathScanner, search} from 'scandal'

// Repository which contains introduction notes for a new user experience,
// to learn the ins and outs of the notational package.
//
// It should also serve as an reference implementation.
class NewUserRepository {

  constructor (doneCallback = () => {}) {
    // TODO read files in sample-repository into simple list items
    this._uuid = 'new-user-repository'
    this._emitter = new Emitter()
    this._files = []

    // store all notes in-memory
    const scanner = new PathScanner(path.join(__dirname + '/notes'), {inclusions: ['*.md']})
    const searcher = new PathSearcher()
    searcher.on('results-found', (r) => {
      this._files.push({
        filename: path.basename(r.filePath),
        content: fs.readFileSync(r.filePath, 'utf8'),
        stat: fs.statSync(r.filePath)
      })
    })
    search(/.+$/ig, scanner, searcher, doneCallback)
  }

  query (q) {
    const items = []

    const regexp = q.searchStr === ''
      ? null
      : new RegExp(q.searchStr, 'ig')

    for (let f of this._files) {
      if (!regexp || (f.filename.match(regexp) || f.content.match(regexp))) {
        items.push({
          title: f.filename,
          mtime: f.stat.mtime,
          cDate: f.stat.ctime
        })
      }
    }

    this._emitter.emit('on-results', {
      uuid: 'new-user-repository',
      count: items.length,
      items: items.slice(q.pageOffset, q.pageSize)
    })
  }

  onResults (callback) {
    return this._emitter.on('on-results', callback)
  }

  dispose () {
    this._emitter.dispose()
    this._emitter = null
    this._scanner = null
    this._searcher = null
  }
}

export default NewUserRepository
