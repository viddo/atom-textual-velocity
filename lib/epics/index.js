/* @flow */

import {combineEpics, createEpicMiddleware} from 'redux-observable'
import config from './config'
import keyDown from './key-down'
import initialScan from './initial-scan'
import preview from './preview'
import selectNote from './select-note'

export default createEpicMiddleware(
  combineEpics(
    selectNote,
    preview,
    config,
    keyDown,
    initialScan))
