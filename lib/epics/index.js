/* @flow */

import {combineEpics, createEpicMiddleware} from 'redux-observable'
import activePaneItem from './active-pane-item'
import configChanges from './config-changes'
import makeHiddenColumns from './hidden-columns'
import makeFileReads from './file-reads'
import makeFileWrites from './file-writes'
import openNote from './open-note'
import pathWatcher from './path-watcher'
import previewNote from './preview-note'

export default function makeEpicMiddleware (columns: Columns, fileReaders: FileReaders, fileWriters: FileWriters) {
  const fileReads = makeFileReads(fileReaders)
  const fileWrites = makeFileWrites(fileWriters)
  const hiddenColumns = makeHiddenColumns(columns)

  return createEpicMiddleware(
    combineEpics(
      activePaneItem,
      configChanges,
      fileReads,
      fileWrites,
      hiddenColumns,
      openNote,
      pathWatcher,
      previewNote
    )
  )
}
