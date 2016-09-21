/* @flow */

import FileIconColumn from './columns/file-icon-column'
import StatsDateColumn from './columns/stats-date-column'
import SummaryColumn from './columns/summary-column'
import contentFileReader from './file-readers/content-file-reader'
import statsFileReader from './file-readers/stats-file-reader'
import renameFileWriter from './file-writers/rename-file-writer'
import StatsDateField from './fields/stats-date-field'
import ParsedPathField from './fields/parsed-path-field'
import Session from './session'
import Service from './service'
import NVTags from './nv-tags'
import defaultConfig from './default-config'

const NAME_FIELD = 'name'
const EXT_FIELD = 'ext'
const LAST_UPDATE_FIELD = 'lastupdate'
const BIRTHTIME_FIELD = 'birthtime'

export const config = defaultConfig

let disposableNvTags
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
    new ParsedPathField({filePropName: NAME_FIELD, parsedPathPropName: 'name'}),
    new ParsedPathField({filePropName: EXT_FIELD, parsedPathPropName: 'ext'}),
    new StatsDateField({filePropName: LAST_UPDATE_FIELD, statsPropName: 'mtime'}),
    new StatsDateField({filePropName: BIRTHTIME_FIELD, statsPropName: 'birthtime'})
  )
  publicServiceAPIV0.registerColumns(
    new FileIconColumn({sortField: EXT_FIELD}),
    new SummaryColumn({sortField: NAME_FIELD}),
    new StatsDateColumn({
      title: 'Last updated',
      description: 'Last updated date',
      filePropName: 'mtime',
      sortField: LAST_UPDATE_FIELD
    }),
    new StatsDateColumn({
      title: 'Created',
      description: 'Created date',
      filePropName: 'birthtime',
      sortField: BIRTHTIME_FIELD
    })
  )
  publicServiceAPIV0.registerFileWriters(renameFileWriter)

  disposableNvTags = NVTags.consumeTextualVelocityServiceV0(publicServiceAPIV0)
  startSession()
}

export function provideServiceV0 () {
  return publicServiceAPIV0
}

export function deactivate () {
  stopSession()
  disposeStartSessionCmd()

  if (disposableNvTags) {
    disposableNvTags.dispose()
    disposableNvTags = null
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
