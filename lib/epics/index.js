/* @flow */

import {combineEpics, createEpicMiddleware} from 'redux-observable'
import activePaneItem from './active-pane-item'
import configChanges from './config-changes'
import openNote from './open-note'
import pathWatcher from './path-watcher'
import previewNote from './preview-note'

export default function makeEpicMiddleware () {
  return createEpicMiddleware(
    combineEpics(
      activePaneItem,
      configChanges,
      openNote,
      pathWatcher,
      previewNote
    )
  )
}
