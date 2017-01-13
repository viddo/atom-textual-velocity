/* @flow */

import Disposables from './disposables'
import Columns from './columns'
import FileReaders from './file-readers'
import NoteFields from './note-fields'
import Service from './service-v0'
import Session from './session'
import nvTags from './service-consumers/nv-tags'
import renameNote from './service-consumers/rename-note'
import defaults from './service-consumers/defaults'
import defaultConfig from './default-config'
import FileIconsReader from './file-readers/file-icons-reader'

const RENAME_CELL_NAME = 'rename'

export const config = defaultConfig

let disposables, columns, fileReaders, noteFields, service, session, sessionCmds, startSessionCmd

export function activate () {
  columns = new Columns()
  fileReaders = new FileReaders()
  noteFields = new NoteFields()
  service = new Service(columns, fileReaders, noteFields)

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

export function deactivate () {
  stopSession()
  disposeStartSessionCmd()

  if (disposables) {
    disposables.dispose()
    disposables = null
  }
  if (service) {
    service = null
  }
  if (columns) {
    columns = null
  }
  if (fileReaders) {
    fileReaders = null
  }
  if (noteFields) {
    noteFields = null
  }
}

function startSession () {
  disposeStartSessionCmd()
  if (!columns || !fileReaders || !noteFields) return

  session = new Session()
  session.start(columns, fileReaders, noteFields)

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
