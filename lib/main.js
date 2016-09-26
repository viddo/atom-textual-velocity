/* @flow */

import R from 'ramda'
import DisposableValues from './disposable-values'
import Session from './session'
import Service from './service'
import NVTags from './service-consumers/nv-tags'
import renameNote from './service-consumers/rename-note'
import defaults from './service-consumers/defaults'
import defaultConfig from './default-config'
import pkg from '../package.json'

const RENAME_CELL_NAME = 'rename'

export const config = defaultConfig

let disposables, notes, service, serviceV0, session, sessionCmds, startSessionCmd

export function activate (state: Object = {}) {
  notes = R.pathOr({}, [pkg.version, atom.config.get('textual-velocity.path')], state)
  service = new Service(notes)
  serviceV0 = service.v0()
  disposables = new DisposableValues(
    defaults.consumeServiceV0(serviceV0, RENAME_CELL_NAME),
    renameNote.consumeServiceV0(serviceV0, RENAME_CELL_NAME),
    NVTags.consumeServiceV0(serviceV0)
  )

  startSession()
}

export function provideServiceV0 () {
  return serviceV0
}

export function serialize () {
  const state = {}
  state[pkg.version] = {}
  state[pkg.version][atom.config.get('textual-velocity.path')] = notes
  return state
}

export function deactivate () {
  stopSession()
  disposeStartSessionCmd()

  if (disposables) {
    disposables.dispose()
    disposables = null
  }
  if (service) {
    service.dispose()
    service = null
    serviceV0 = null
  }
}

function startSession () {
  if (!service) return
  disposeStartSessionCmd()

  session = new Session(service)

  sessionCmds = atom.commands.add('atom-workspace', {
    'textual-velocity:restart-session': () => {
      stopSession()
      startSession()
    },
    'textual-velocity:stop-session': () => {
      stopSession()
      startSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:start-session', startSession)
    }
  })
}

function stopSession () {
  if (sessionCmds) {
    sessionCmds.dispose()
    sessionCmds = null
  }
  if (session) {
    session.dispose()
    session = null
  }
}

function disposeStartSessionCmd () {
  if (startSessionCmd) {
    startSessionCmd.dispose()
    startSessionCmd = null
  }
}
