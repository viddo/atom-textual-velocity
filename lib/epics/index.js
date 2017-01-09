/* @flow */

import {combineEpics, createEpicMiddleware} from 'redux-observable'
import activePaneItem from './active-pane-item'
import configChanges from './config-changes'
import makeFileReads from './file-reads'
import openNote from './open-note'
import pathWatcher from './path-watcher'
import previewNote from './preview-note'

export default function makeEpicMiddleware (fileReaders: FileReaders) {
  const fileReads = makeFileReads(fileReaders)

  return createEpicMiddleware(
    combineEpics(
      activePaneItem,
      configChanges,
      fileReads,
      openNote,
      pathWatcher,
      previewNote
    )
  )
}
