/* @flow */

import {combineEpics, createEpicMiddleware} from 'redux-observable'
import configEpic from './config'
import initialScanEpic from './initial-scan'

export default createEpicMiddleware(
  combineEpics(
    configEpic,
    initialScanEpic))
