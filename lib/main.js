/* @flow */

import DisposableValues from './disposable-values'
import Session from './session'
import Service from './service'
import nvTags from './service-consumers/nv-tags'
import renameNote from './service-consumers/rename-note'
import defaults from './service-consumers/defaults'
import defaultConfig from './default-config'
import NotesCache from './notes-cache'

const RENAME_CELL_NAME = 'rename'

export const config = defaultConfig

let disposables, notesCache, service, serviceV0, session, sessionCmds, startSessionCmd

export function activate () {
  notesCache = new NotesCache()
  service = new Service()
  serviceV0 = service.v0()
  disposables = new DisposableValues(
    defaults.consumeServiceV0(serviceV0, RENAME_CELL_NAME),
    renameNote.consumeServiceV0(serviceV0, RENAME_CELL_NAME),
    nvTags.consumeServiceV0(serviceV0)
  )

  startSession()
}

export function provideServiceV0 () {
  return serviceV0
}

export function deactivate () {
  if (notesCache) {
    notesCache.save(() => {
      if (notesCache) {
        notesCache.dispose()
        notesCache = null
      }
    })
  }

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
  disposeStartSessionCmd()
  if (!notesCache) return

  notesCache.load(notes => {
    if (!service) return
    session = new Session(service, notes)

    sessionCmds = atom.commands.add('atom-workspace', {
      'textual-velocity:restart-session': () => {
        stopSession()
        if (notesCache) notesCache.save(startSession)
      },
      'textual-velocity:stop-session': () => {
        stopSession()
        startSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:start-session', startSession)
      }
    })
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
