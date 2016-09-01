/* @flow */

import {Directory} from 'atom'
import Bacon from 'baconjs'
import Path from 'path'
import fs from 'fs-plus'
import R from 'ramda'
import * as atoms from './atom-streams'

export default class ViewCtrl {

  activePathStream: Bacon.Stream
  clickedRowStream: Bacon.Stream
  keyDownStream: Bacon.Stream
  keyEnterStream: Bacon.Stream
  keyEscStream: Bacon.Stream
  keyUpStream: Bacon.Stream
  listHeightStream: Bacon.Stream
  rowHeightStream: Bacon.Stream
  scrollTopStream: Bacon.Stream
  sessionStartStream: Bacon.Strea
  sortDirectionStream: Bacon.Stream
  sortFieldStream: Bacon.Stream
  textInputStream: Bacon.Stream

  _startSessionBus: Bacon.Bus

  constructor (view: ViewType) {
    this.sessionStartStream = this._startSessionBus = new Bacon.Bus()

    this.clickedRowStream = view.clickedRowStream
    this.scrollTopStream = view.scrollTopStream
    this.textInputStream = view.textInputStream

    const newKeyStream = keyCode => view.keyDownStream.filter(R.propEq('keyCode', keyCode)).doAction('.preventDefault')
    this.keyDownStream = newKeyStream(40)
    this.keyEnterStream = newKeyStream(13)
    this.keyEscStream = newKeyStream(27)
    this.keyUpStream = newKeyStream(38)

    this.listHeightStream = atoms.createConfigStream('textual-velocity.listHeight').merge(view.listHeightStream).skipDuplicates()
    this.rowHeightStream = atoms.createConfigStream('textual-velocity.rowHeight').skipDuplicates()
    this.sortDirectionStream = atoms.createConfigStream('textual-velocity.sortDirection').skipDuplicates()
    this.sortFieldStream = atoms.createConfigStream('textual-velocity.sortField').skipDuplicates()

    this.activePathStream = atoms
      .createStream(atom.workspace, 'observeActivePaneItem')
      .map('.getBuffer.getPath')
      .filter(R.identity)
      .skip(1)
  }

  activate () {
    const req: SessionType = {
      excludeVcsIgnoredPaths: atom.config.get('core.excludeVcsIgnoredPaths'),
      ignoredNames: atom.config.get('core.ignoredNames'),
      listHeight: atom.config.get('textual-velocity.listHeight'),
      rootPath: this._normalizedPath(atom.config.get('textual-velocity.path')),
      rowHeight: atom.config.get('textual-velocity.rowHeight')
    }
    this._startSessionBus.push(req)
  }

  deactivate () {
    this._startSessionBus.end()
    this._startSessionBus = null
  }

  _normalizedPath (path: string): string {
    path = fs.normalize(path.trim() || 'notes')

    if (!Path.isAbsolute(path)) {
      path = Path.join(atom.configDirPath, path)
    }

    (new Directory(path)).create() // make sure directory exists

    return path
  }

}
