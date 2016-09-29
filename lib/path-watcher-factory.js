/* @flow */

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import fs from 'fs'
import Sifter from 'sifter'
import DisposableValues from './disposable-values'

export default class PathWatcherFactory {

  _notesCache: Object
  _fileReadersP: Bacon.Property
  _fieldsP: Bacon.Property

  constructor (service: ServiceType) {
    this._fileReadersP = service.fileReadersP
    this._fieldsP = service.fieldsP
  }

  watch (notesCache: Object, notesPath: NotesPathType, filter: NotesFileFilterType): PathWatcherType {
    const disposables = new DisposableValues()

    Object.keys(notesCache).forEach(filename => {
      // Reset ready state, will be updated again on verifying the fileReaders have been run
      notesCache[filename].ready = null
    })

    const chokidarWatch = chokidar.watch(notesPath.root, {
      ignored: 'node_modules',
      persistent: true,
      depth: 0,
      cwd: notesPath.root
    })
    const initialScanDoneS = Bacon.fromEvent(chokidarWatch, 'ready').map(true)

    const createFileStream = (event: string) => {
      return Bacon
        .fromEvent(chokidarWatch, event)
        .flatMap((filename: string, stats: FsStatsType) => {
          return filter.isAccepted(notesPath.fullPath(filename))
            ? {
              filename: filename,
              stats: stats || fs.statSync(notesPath.fullPath(filename)) // stats is not guaranteed to be available by chokidar, make sure it's present
            }
            : Bacon.never()
        })
    }

    const createFileReaderResultsStream = (filesStream, notes) => {
      return Bacon
        .combineTemplate({
          file: filesStream,
          fileReaders: this._fileReadersP
        })
        .sampledBy(filesStream) // only trigger stream on file changes
        .bufferingThrottle(0) // ms, throttle files enough to avoid making app unresponsive
        .flatMap((t: {file: FileType, fileReaders: Array<FileReaderType>}) => {
          const {filename} = t.file

          let fileReaders = t.fileReaders
          if (notes) {
            const note = notes[filename]
            if (note && note.stats.mtime.getTime() === t.file.stats.mtime.getTime()) {
              fileReaders = fileReaders.filter(fileReader => note[fileReader.notePropName] === undefined)
            }
            if (fileReaders.length === 0) return Bacon.never() // e.g. a cached note that have all read values already
          }

          return Bacon
            .fromArray(fileReaders)
            .flatMap((fileReader: FileReaderType) => {
              const readResult: FileReaderResultType = {
                filename: filename,
                notePropName: fileReader.notePropName,
                value: null
              }
              return Bacon
                .fromNodeCallback(fileReader.read, notesPath.fullPath(filename))
                .map(value => {
                  readResult.value = value === undefined ? null : value // make sure value cannot be undefined
                  return readResult
                })
                .mapError(err => {
                  console.warn('failed to read file:', err)
                  return readResult
                })
            })
        })
    }

    const newFilesS = createFileStream('add')

    const fileReaderResultS = Bacon
      .mergeAll(
        createFileReaderResultsStream(newFilesS, notesCache),
        createFileReaderResultsStream(createFileStream('change'))
      )

    const updateNoteProps = (note: Object, fields: Array<FieldType>, filename: string) => {
      note.id = process.hrtime().toString()
      fields.forEach(field => {
        if (field.value) {
          note[field.notePropName] = field.value(note, filename)
        }
      })
    }

    const sifterP = Bacon
      .update(
        new Sifter(notesCache),
        [newFilesS, this._fieldsP, this._fileReadersP], (sifter: Sifter, file: FileType, fields: Array<FieldType>, fileReaders: Array<FileReaderType>) => {
          let note = sifter.items[file.filename]
          if (note) {
            note.ready = fileReaders.every(fileReader => note[fileReader.notePropName] !== undefined)
          } else {
            note = sifter.items[file.filename] = {
              stats: file.stats,
              ready: false
            }
          }
          updateNoteProps(note, fields, file.filename)
          return sifter
        },
        [fileReaderResultS, this._fieldsP, this._fileReadersP], (sifter: Sifter, readResult: FileReaderResultType, fields: Array<FieldType>, fileReaders: Array<FileReaderType>) => {
          const note = sifter.items[readResult.filename]
          if (note) { // guard for note not existing, e.g. if file was removed before file-readers finished
            note[readResult.notePropName] = readResult.value
            note.ready = fileReaders.every(fileReader => note[fileReader.notePropName] !== undefined)
            updateNoteProps(note, fields, readResult.filename)
          }
          return sifter
        },
        [Bacon.fromEvent(chokidarWatch, 'unlink')], (sifter: Sifter, filename: string) => {
          if (sifter.items.hasOwnProperty(filename)) {
            delete sifter.items[filename]
          }
          return sifter
        },
        [initialScanDoneS], (sifter) => {
          // Remove all items that do not exist anymore
          Object.keys(sifter.items).forEach(filename => {
            if (sifter.items[filename].ready === null) {
              delete sifter.items[filename]
            }
          })
          return sifter
        })

    const initialScanDoneP = initialScanDoneS.toProperty()

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
