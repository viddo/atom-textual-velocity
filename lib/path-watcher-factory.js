/* @flow */

import Bacon from 'baconjs'
import chokidar from 'chokidar'
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

    const createFileStream = (event: string) => {
      return Bacon
        .fromEvent(chokidarWatch, event, (relPath: string, stats: FsStatsType) => {
          if (filter.isAccepted(notesPath.fullPath(relPath))) {
            return {
              relPath: relPath,
              stats: stats // only available for 'add' event (and even then not guaranteed); checked for fileReaders below
            }
          }
        })
        .filter(R.is(Object))
    }
    const addFilesS = createFileStream('add')
    const changedFileS = createFileStream('change')
    const removedFileS = createFileStream('unlink')
    const fileischS = addFilesS.merge(changedFileS)

    const fileReadS = Bacon
      .combineTemplate({
        fileisch: fileischS,
        fileReaders: this._fileReadersP,
        fileReadersForNewFiles: this._fileReadersP.filter(fileReader => !fileReader.skipIfHasStatsForNewFile)
      })
      .sampledBy(fileischS) // only trigger stream on file changes
      .bufferingThrottle(1) // ms, slight throttle to not clog down the system
      .flatMap((t: {fileisch: FileischType, fields: Array<FieldType>, fileReaders: Array<FileReaderType>, fileReadersForNewFiles: Array<FileReaderType>}) => {
        const path = notesPath.fullPath(t.fileisch.relPath)

        return Bacon
          .fromArray(t.fileisch.stats ? t.fileReadersForNewFiles : t.fileReaders)
          .bufferingThrottle(1) // ms, slight throttle to not clog down the system
          .flatMap((fileReader: FileReaderType) => {
            return Bacon
              .fromNodeCallback(fileReader.read, path)
              .map(value => ({
                path: path,
                value: value,
                filePropName: fileReader.filePropName
              }))
          })
      })

    const sifterP = Bacon
      .update(
        new Sifter([]),
        [addFilesS], (sifter: Sifter, fileisch: FileischType) => {
          const file = notesPath.newFile(fileisch.relPath)
          if (fileisch.stats) {
            file.stats = fileisch.stats
          }
          sifter.items.push(file)
          return sifter
        },
        [fileReadS, this._fieldsP], (sifter: Sifter, readResult: {path: string, value: any, filePropName: string}, fields: Array<FieldType>) => {
          const file = sifter.items.find(file => file.path === readResult.path)
          if (file) { // guard for file not existing, e.g. if file was removed before file-readers finished
            file[readResult.filePropName] = readResult.value
            fields.forEach(field => {
              if (field.value) {
                file[field.filePropName] = field.value(file)
              }
            })
          }
          return sifter
        },
        [removedFileS], (sifter: Sifter, fileisch: FileischType) => {
          sifter.items = sifter.items.filter(file => file.relPath !== fileisch.relPath)
          return sifter
        })

    const initialScanDoneP = Bacon
      .fromEvent(chokidarWatch, 'ready')
      .map(true)
      .toProperty()

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
