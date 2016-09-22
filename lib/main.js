/* @flow */

import FileIconColumn from './columns/file-icon-column'
import StatsDateColumn from './columns/stats-date-column'
import SummaryColumn from './columns/summary-column'
import contentFileReader from './file-readers/content-file-reader'
import statsFileReader from './file-readers/stats-file-reader'
import StatsDateField from './fields/stats-date-field'
import ParsedPathField from './fields/parsed-path-field'
import DisposableValues from './disposable-values'
import Session from './session'
import Service from './service'
import NVTags from './nv-tags'
import renameNote from './rename-note'
import defaultConfig from './default-config'

const NAME_FIELD = 'name'
const EXT_FIELD = 'ext'
const LAST_UPDATE_FIELD = 'lastupdate'
const BIRTHTIME_FIELD = 'birthtime'
const RENAME_CELL_NAME = 'base'

export const config = defaultConfig

let disposables
let service
let publicServiceAPIV0
let session
let sessionCmds
let startSessionCmd

export function activate (state?: Object) {
  service = new Service()
  publicServiceAPIV0 = service.publicAPI()

  publicServiceAPIV0.registerFileReaders(contentFileReader, statsFileReader)
  publicServiceAPIV0.registerFields(
    contentFileReader,
    new ParsedPathField({notePropName: NAME_FIELD, parsedPathPropName: 'name'}),
    new ParsedPathField({notePropName: EXT_FIELD, parsedPathPropName: 'ext'}),
    new StatsDateField({notePropName: LAST_UPDATE_FIELD, statsPropName: 'mtime'}),
    new StatsDateField({notePropName: BIRTHTIME_FIELD, statsPropName: 'birthtime'})
  )
  publicServiceAPIV0.registerColumns(
    new FileIconColumn({sortField: EXT_FIELD}),
    new SummaryColumn({sortField: NAME_FIELD, editCellName: RENAME_CELL_NAME}),
    new StatsDateColumn({
      title: 'Last updated',
      description: 'Last updated date',
      notePropName: 'mtime',
      sortField: LAST_UPDATE_FIELD
    }),
    new StatsDateColumn({
      title: 'Created',
      description: 'Created date',
      notePropName: 'birthtime',
      sortField: BIRTHTIME_FIELD
    })
  )

  disposables = new DisposableValues(
    NVTags.consumeTextualVelocityServiceV0(publicServiceAPIV0),
    renameNote.consumeTextualVelocityServiceV0(publicServiceAPIV0, RENAME_CELL_NAME)
  )

  startSession()
}

export function provideServiceV0 () {
  return publicServiceAPIV0
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
    publicServiceAPIV0 = null
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
