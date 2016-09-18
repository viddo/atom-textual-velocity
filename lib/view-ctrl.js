/* @flow */

import {Directory} from 'atom'
import Bacon from 'baconjs'
import Path from 'path'
import fs from 'fs-plus'
import R from 'ramda'
import * as atoms from './atom-streams'

export default class ViewCtrl {

  abortEditCellS: Bacon.Stream
  activePathS: Bacon.Stream
  clickedCellS: Bacon.Stream
  dblClickedCellS: Bacon.Stream
  keyDownS: Bacon.Stream
  keyEnterS: Bacon.Stream
  keyEscS: Bacon.Stream
  keyUpS: Bacon.Stream
  listHeightS: Bacon.Stream
  rowHeightS: Bacon.Stream
  saveEditedCellContentS: Bacon.Stream
  scrollTopS: Bacon.Stream
  sessionStartS: Bacon.Strea
  sortDirectionS: Bacon.Stream
  sortFieldS: Bacon.Stream
  textInputS: Bacon.Stream

  _startSessionBus: Bacon.Bus

  constructor (view: ViewType) {
    this.sessionStartS = this._startSessionBus = new Bacon.Bus()

    this.abortEditCellS = view.abortEditCellS
    this.clickedCellS = view.clickedCellS
    this.dblClickedCellS = view.dblClickedCellS
    this.saveEditedCellContentS = view.saveEditedCellContentS
    this.scrollTopS = view.scrollTopS
    this.textInputS = view.textInputS

    const newKeyS = keyCode => view.keyDownS.filter(R.propEq('keyCode', keyCode)).doAction('.preventDefault')
    this.keyDownS = newKeyS(40)
    this.keyEnterS = newKeyS(13)
    this.keyEscS = newKeyS(27)
    this.keyUpS = newKeyS(38)

    this.listHeightS = atoms.createConfigStream('textual-velocity.listHeight').merge(view.listHeightS).skipDuplicates()
    this.rowHeightS = atoms.createConfigStream('textual-velocity.rowHeight').skipDuplicates()
    this.sortDirectionS = atoms.createConfigStream('textual-velocity.sortDirection').skipDuplicates()
    this.sortFieldS = atoms.createConfigStream('textual-velocity.sortField').skipDuplicates()

    this.activePathS = atoms
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
