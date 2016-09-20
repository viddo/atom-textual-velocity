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

    const createFileStream = (event) => {
      return Bacon
        .fromEvent(chokidarWatch, event, (relPath, stats) => {
          if (filter.isAccepted(notesPath.fullPath(relPath))) {
            const file = notesPath.newFile(relPath)
            if (stats) {
              file.stats = stats
            }
            return file
          }
        })
        .filter(R.is(Object))
    }
    const addFilesS = createFileStream('add')
    const changedFileS = createFileStream('change')
    const removedFileS = createFileStream('unlink')

    const createFileReaderStream = (filesS, contextInfo = {}) => {
      return Bacon
        .combineTemplate({
          file: filesS,
          fields: this._fieldsP,
          fileReaders: this._fileReadersP
        })
        .bufferingThrottle(2) // ms, slight throttle to not clog down the system
        .flatMap((t: {file: NotesFileType, fields: Array<FieldType>, fileReaders: Array<FileReaderType>}) => {
          const {file} = t
          return Bacon
            .fromArray(t.fileReaders)
            .bufferingThrottle(1) // ms, slight throttle to not clog down the system
            .flatMap((fileReader: FileReaderType) => {
              if (fileReader.skipRead && fileReader.skipRead(file, contextInfo)) return Bacon.never()

              return Bacon
                .fromNodeCallback(fileReader.read, file.path)
                .map(val => {
                  file[fileReader.filePropName] = val
                  t.fields.forEach(field => {
                    if (field.value) {
                      file[field.filePropName] = field.value(file)
                    }
                  })
                  return file
                })
            })
        })
    }
    const readChangesFilesS = Bacon
      .mergeAll(
        createFileReaderStream(addFilesS, {isNewFile: true}),
        createFileReaderStream(changedFileS))

    const sifterP = Bacon
      .update(
        new Sifter([]),
        [addFilesS], (sifter, newFile) => {
          sifter.items.push(newFile)
          return sifter
        },
        [readChangesFilesS], (sifter, changedFile) => {
          sifter.items = sifter.items.map(file =>
            file.relPath === changedFile.relPath
              ? changedFile
              : file)
          return sifter
        },
        [removedFileS], (sifter, removedFile) => {
          sifter.items = sifter.items.filter(f => f.relPath !== removedFile.relPath)
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
