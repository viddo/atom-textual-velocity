/* @flow */

import chokidar from 'chokidar'
import Path from 'path'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import NotesFileFilter from './notes-file-filter'
import store from './store'
import App from './react/app'

export default class Session {

  _panel: Atom$Panel
  _chokidarWatch: chokidar

  constructor () {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })
    render(<Provider store={store}>
      <App />
    </Provider>, this._panel.getItem())

    const dir = atom.config.get('textual-velocity.path')

    this._chokidarWatch = chokidar.watch(dir, {
      ignored: 'node_modules',
      persistent: true,
      depth: 0,
      cwd: dir
    })

    const fileFilter = new NotesFileFilter(dir, {
      exclusions: atom.config.get('textual-velocity.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('textual-velocity.excludeVcsIgnoredPaths')
    })
    const fileActionCreator = type => (filename, stats) => {
      const path = Path.join(dir, filename)
      if (fileFilter.isAccepted(path)) {
        store.dispatch({
          type: type,
          filename: filename,
          stats: stats
        })
      }
    }
    this._chokidarWatch.on('ready', () => ({type: 'FINISHED_DIR_SCAN'}))
    this._chokidarWatch.on('add', fileActionCreator('ADDED_FILE'))
    this._chokidarWatch.on('change', fileActionCreator('CHANGED_FILE'))
    this._chokidarWatch.on('unlink', fileActionCreator('REMOVED_FILE'))
  }

  dispose () {
    this._chokidarWatch.close()
    this._panel.destroy()
  }
}
