/* @flow */

import Disposables from './disposables'
import Session from './session'
import Service from './service'
import nvTags from './service-consumers/nv-tags'
import renameNote from './service-consumers/rename-note'
import defaults from './service-consumers/defaults'
import defaultConfig from './default-config'
import NotesCache from './notes-cache'
import FileIconsReader from './file-readers/file-icons-reader'

const RENAME_CELL_NAME = 'rename'

export const config = defaultConfig

let disposables, notesCache, service, serviceV0, session, sessionCmds, startSessionCmd

export function activate () {
  notesCache = new NotesCache()
  service = new Service()
  serviceV0 = service.v0()
  disposables = new Disposables(
    defaults.consumeServiceV0(serviceV0, RENAME_CELL_NAME),
    renameNote.consumeServiceV0(serviceV0, RENAME_CELL_NAME),
    nvTags.consumeServiceV0(serviceV0)
  )

  startSession()
}

// Integration with https://atom.io/packages/file-icons
export function consumeFileIconsService (fileIconsService: any) {
  const fileIconsReader = new FileIconsReader(fileIconsService)

  if (serviceV0) {
    serviceV0.registerFileReaders(fileIconsReader)
  }

  return new Disposables(() => {
    if (serviceV0) {
      serviceV0.deregisterFileReaders(fileIconsReader)
    }
  })
}

export function provideServiceV0 () {
  return serviceV0
}

export async function deactivate () {
  if (notesCache) {
    try {
      await notesCache.save()
    } catch (err) {
      console.warn('textual-velocity: could not cache notes', err)
    }
    notesCache.dispose()
    notesCache = null
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

async function startSession () {
  disposeStartSessionCmd()
  if (!notesCache || !service) return

  const notes = await notesCache.load()
  console.log(notes)
  session = new Session()

  sessionCmds = atom.commands.add('atom-workspace', {
    'textual-velocity:restart-session': async () => {
      stopSession()
      if (notesCache) {
        await notesCache.save()
      }
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
