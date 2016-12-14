/* @flow */

import {combineEpics, createEpicMiddleware} from 'redux-observable'
import configEpic from './config'
import keyDownEpic from './key-down'
import initialScanEpic from './initial-scan'

export default createEpicMiddleware(
  combineEpics(
    configEpic,
    keyDownEpic,
    initialScanEpic))
