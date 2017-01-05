/* @flow */

import {combineEpics, createEpicMiddleware} from 'redux-observable'
import activePaneItem from './active-pane-item'
import config from './config'
import openNote from './open-note'
import pathWatcher from './path-watcher'
import previewNote from './preview-note'

export default createEpicMiddleware(
  combineEpics(
    activePaneItem,
    config,
    openNote,
    pathWatcher,
    previewNote
  )
)
