/* @flow */

import Bacon from 'baconjs'
import chokidar from 'chokidar'
import R from 'ramda'
import Sifter from 'sifter'
import DisposableValues from './disposable-values'

export default class PathWatcherFactory {

  _fieldsProp: Bacon.Property
  _fileReadersProp: Bacon.Property

  constructor (params: {fileReadersProp: Bacon.Property, fieldsProp: Bacon.Property}) {
    this._fieldsProp = params.fieldsProp
    this._fileReadersProp = params.fileReadersProp
  }

  watch (notesPath: NotesPathType, filter: NotesPathFilterType): PathWatcherType {
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
    const addFilesStream = createFileStream('add')
    const changedFileStream = createFileStream('change')
    const removedFileStream = createFileStream('unlink')

    const createFileReaderStream = (filesStream, contextInfo = {}) => {
      return Bacon
        .combineTemplate({
          file: filesStream,
          fields: this._fieldsProp,
          fileReaders: this._fileReadersProp
        })
        .flatMap((t: {file: NotesFileType, fields: Array<FieldType>, fileReaders: Array<FileReaderType>}) => {
          const {file} = t
          return Bacon
            .fromArray(t.fileReaders)
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
    const readChangesFilesStream = Bacon
      .mergeAll(
        createFileReaderStream(addFilesStream, {isNewFile: true}),
        createFileReaderStream(changedFileStream))

    const sifterProp = Bacon
      .update(
        new Sifter([]),
        [addFilesStream], (sifter, newFile) => {
          sifter.items.push(newFile)
          return sifter
        },
        [readChangesFilesStream], (sifter, changedFile) => {
          sifter.items = sifter.items.map(file =>
            file.relPath === changedFile.relPath
              ? changedFile
              : file)
          return sifter
        },
        [removedFileStream], (sifter, removedFile) => {
          sifter.items = sifter.items.filter(f => f.relPath !== removedFile.relPath)
          return sifter
        })

    const initialScanDoneProp = Bacon
      .fromEvent(chokidarWatch, 'ready')
      .map(true)
      .toProperty()

    disposables.add( // Make sure to have listeners from start to not miss any initial events
      initialScanDoneProp.onValue(() => {}),
      sifterProp.onValue(() => {})
    )

    return {
      initialScanDoneProp: initialScanDoneProp,
      sifterProp: sifterProp,

      dispose: () => {
        disposables.dispose()
        chokidarWatch.close()
      }
    }
  }
}
