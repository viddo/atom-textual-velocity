/* @flow */

import chokidar from 'chokidar'
import Bacon from 'baconjs'
import R from 'ramda'
import DisposableValues from './disposable-values'

export default class PathWatcherFactory {

  _fileReadersProp: Bacon.Property

  constructor (fileReadersProp: Bacon.Property) {
    this._fileReadersProp = fileReadersProp
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
              file.data.stats = stats
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
          fileReaders: this._fileReadersProp
        })
        .flatMap((t: {file: NotesFileType, fileReaders: Array<FileReaderType>}) => {
          const {file} = t
          return Bacon
            .fromArray(t.fileReaders)
            .flatMap((fileReader: FileReaderType) => {
              return !fileReader.skipRead || !fileReader.skipRead(file, contextInfo)
                ? Bacon
                  .fromNodeCallback(fileReader.read, file.path)
                  .map(val => {
                    file.data[fileReader.propName] = val
                    return file
                  })
                : Bacon.never()
            })
        })
    }
    const readChangesFilesStream = Bacon
      .mergeAll(
        createFileReaderStream(addFilesStream, {isNewFile: true}),
        createFileReaderStream(changedFileStream))

    const filesProp = Bacon
      .update(
        [],
        [addFilesStream], (files, newFile) => {
          files.push(newFile)
          return files
        },
        [readChangesFilesStream], (files, changedFile) => {
          return files.map(file =>
            file.relPath === changedFile.relPath
              ? changedFile
              : file)
        },
        [removedFileStream], (files, removedFile) => {
          return files.filter(f => f.relPath !== removedFile.relPath)
        })

    const initialScanDoneProp = Bacon
      .fromEvent(chokidarWatch, 'ready')
      .map(true)
      .toProperty()

    disposables.add( // Make sure to have listeners from start to not miss any initial events
      initialScanDoneProp.onValue(() => {}),
      filesProp.onValue(() => {})
    )

    return {
      initialScanDoneProp: initialScanDoneProp,
      filesProp: filesProp,

      dispose: () => {
        disposables.dispose()
        chokidarWatch.close()
      }
    }
  }
}
