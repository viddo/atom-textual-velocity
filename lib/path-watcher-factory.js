/* @flow */

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import R from 'ramda'
import Sifter from 'sifter'
import DisposableValues from './disposable-values'

export default class PathWatcherFactory {

  _fieldsP: Bacon.Property
  _fileReadersP: Bacon.Property

  constructor (params: {fileReadersP: Bacon.Property, fieldsP: Bacon.Property}) {
    this._fieldsP = params.fieldsP
    this._fileReadersP = params.fileReadersP
  }

  watch (notesPath: NotesPathType, filter: NotesFileFilterType): PathWatcherType {
    const disposables = new DisposableValues()

    const chokidarWatch = chokidar.watch(notesPath.root, {
      ignored: 'node_modules',
      persistent: true,
      depth: 0,
      cwd: notesPath.root
    })

    const initialScanDoneP = Bacon
      .fromEvent(chokidarWatch, 'ready')
      .map(true)
      .toProperty()

    const createFileStream = (event: string) => {
      return Bacon
        .fromEvent(chokidarWatch, event, (relPath: string, stats: FsStatsType) => {
          if (filter.isAccepted(notesPath.fullPath(relPath))) {
            const file: FileType = {
              relPath: relPath,
              stats: stats // only available for 'add' event (and even then not guaranteed); checked for fileReaders below
            }
            return file
          }
        })
        .filter(R.is(Object))
    }
    const newFilesS = createFileStream('add')
    const changedFileS = createFileStream('change')
    const removedFileS = createFileStream('unlink')

    const newAndChangedFilesS = newFilesS.merge(changedFileS)
    const fileReaderResultS = Bacon
      .combineTemplate({
        file: newAndChangedFilesS,
        fileReaders: this._fileReadersP,
        fileReadersForNewFiles: this._fileReadersP.filter(fileReader => !fileReader.skipIfHasStatsForNewFile)
      })
      .sampledBy(newAndChangedFilesS) // only trigger stream on file changes
      .bufferingThrottle(1) // ms, slight throttle to not make app unresponsive
      .flatMap((t: {file: FileType, fileReaders: Array<FileReaderType>, fileReadersForNewFiles: Array<FileReaderType>}) => {
        const {relPath} = t.file
        return Bacon
          .fromArray(t.file.stats ? t.fileReadersForNewFiles : t.fileReaders)
          .bufferingThrottle(1) // ms, slight throttle to not make app unresponsive
          .flatMap((fileReader: FileReaderType) => {
            return Bacon
              .fromNodeCallback(fileReader.read, notesPath.fullPath(relPath))
              .map(value => {
                const readResult: FileReaderResultType = {
                  relPath: relPath,
                  value: value,
                  notePropName: fileReader.notePropName
                }
                return readResult
              })
          })
      })

    const sifter = new Sifter({})
    const updateNote = (note: Object, fields: Array<FieldType>, relPath: string) => {
      note.id = process.hrtime().toString()
      fields.forEach(field => {
        if (field.value) {
          note[field.notePropName] = field.value(note, relPath)
        }
      })
    }

    const sifterP = Bacon
      .update(sifter,
        [newFilesS, this._fieldsP], (sifter: Sifter, file: FileType, fields: Array<FieldType>) => {
          const note = {
            // make sure stats is available for new files
            stats: file.stats || fs.statSync(notesPath.fullPath(file.relPath))
          }
          updateNote(note, fields, file.relPath)
          sifter.items[file.relPath] = note
          return sifter
        },
        [fileReaderResultS, this._fieldsP], (sifter: Sifter, res: FileReaderResultType, fields: Array<FieldType>) => {
          const {relPath} = res
          const note = sifter.items[relPath]
          if (note) { // guard for note not existing, e.g. if file was removed before file-readers finished
            note[res.notePropName] = res.value
            updateNote(note, fields, relPath)
          }
          return sifter
        },
        [removedFileS], (sifter: Sifter, file: FileType) => {
          if (sifter.items && sifter.items.hasOwnProperty(file.relPath)) {
            delete sifter.items[file.relPath]
          }
          return sifter
        })

    disposables.add( // Make sure to have listeners from start to not miss any initial events
      initialScanDoneP.onValue(() => {}),
      sifterP.onValue(() => {})
    )

    return {
      initialScanDoneP: initialScanDoneP,
      sifterP: sifterP,

      dispose: () => {
        disposables.dispose()
        chokidarWatch.close()
      }
    }
  }
}
