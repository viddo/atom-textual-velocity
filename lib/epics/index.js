/* @flow */

import {combineEpics, createEpicMiddleware} from 'redux-observable'
import config from './config'
import keyPress from './key-press'
import pathWatcher from './path-watcher'
import preview from './preview'
import selectNote from './select-note'

export default createEpicMiddleware(
  combineEpics(
    selectNote,
    preview,
    config,
    keyPress,
    pathWatcher))
