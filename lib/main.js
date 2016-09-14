/* @flow */

import FileIconColumn from './columns/file-icon-column'
import StatsDateColumn from './columns/stats-date-column'
import SummaryColumn from './columns/summary-column'
import contentFileReader from './file-readers/content-file-reader'
import statsFileReader from './file-readers/stats-file-reader'
import renameFileWriter from './file-writers/rename-file-writer'
import FileField from './fields/file-field'
import StatsDateField from './fields/stats-date-field'
import Session from './session'
import Service from './service'
import NVTags from './nv-tags'
import defaultConfig from './default-config'

const SORT_FIELD_EXT = 'ext'
const SORT_FIELD_SUMMARY = 'fnamecontent'
const SORT_FIELD_LAST_UPDATE = 'lastupdate'
const SORT_FIELD_BIRTHTIME = 'birthtime'

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
    new FileField({name: SORT_FIELD_SUMMARY, propPath: 'name'}),
    new FileField({name: SORT_FIELD_EXT, propPath: 'ext'}),
    new FileField({name: 'content', propPath: 'data.content'}),
    new StatsDateField({name: SORT_FIELD_LAST_UPDATE, prop: 'mtime'}),
    new StatsDateField({name: SORT_FIELD_BIRTHTIME, prop: 'birthtime'})
  )
  publicServiceAPIV0.registerColumns(
    new FileIconColumn({sortField: SORT_FIELD_EXT}),
    new SummaryColumn({sortField: SORT_FIELD_SUMMARY}),
    new StatsDateColumn({
      title: 'Last updated',
      description: 'Last updated date',
      prop: 'mtime',
      sortField: SORT_FIELD_LAST_UPDATE
    }),
    new StatsDateColumn({
      title: 'Created',
      description: 'Created date',
      prop: 'birthtime',
      sortField: SORT_FIELD_BIRTHTIME
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
