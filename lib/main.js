/* @flow */

import Disposables from './disposables'
import Columns from './columns'
import NotesFields from './notes-fields'
import Service from './service-v0'
import Session from './session'
import nvTags from './service-consumers/nv-tags'
import renameNote from './service-consumers/rename-note'
import defaults from './service-consumers/defaults'
import defaultConfig from './default-config'
import NotesCache from './notes-cache'
import FileIconsReader from './file-readers/file-icons-reader'
import setupRootReducer from './reducers'

const RENAME_CELL_NAME = 'rename'

export const config = defaultConfig

let disposables, columns, notesFields, notesCache, service, session, sessionCmds, startSessionCmd

export function activate () {
  notesCache = new NotesCache()

  columns = new Columns()
  notesFields = new NotesFields()
  service = new Service(columns, notesFields)

  disposables = new Disposables(
    defaults.consumeServiceV0(service, RENAME_CELL_NAME),
    renameNote.consumeServiceV0(service, RENAME_CELL_NAME),
    nvTags.consumeServiceV0(service)
  )

  startSession()
}

// Integration with https://atom.io/packages/file-icons
export function consumeFileIconsService (fileIconsService: any) {
  const fileIconsReader = new FileIconsReader(fileIconsService)

  if (service) {
    service.registerFileReaders(fileIconsReader)
  }

  return new Disposables(() => {
    if (service) {
      service.deregisterFileReaders(fileIconsReader)
    }
  })
}

export function provideServiceV0 () {
  return service
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
  if (notesFields) {
    notesFields = null
    service = null
  }
}

async function startSession () {
  disposeStartSessionCmd()
  if (!notesCache || !notesFields) return

  const notes = await notesCache.load()
  console.log(notes)

  const rootReducer = setupRootReducer(columns, notesFields)
  session = new Session(rootReducer)

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
