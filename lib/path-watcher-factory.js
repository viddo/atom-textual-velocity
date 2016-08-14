'use babel'

import chokidar from 'chokidar'
import DisposableValues from './disposable-values'
import fs from 'fs'
import Bacon from 'baconjs'
import R from 'ramda'

export default {

  watch: ({path, filter}) => {
    const disposables = new DisposableValues()

    const chokidarWatch = chokidar.watch(path.root, {
      ignored: 'node_modules',
      persistent: true,
      cwd: path.root
    })

    const createFileStream = (event) => {
      return Bacon
        .fromEvent(chokidarWatch, event, (relPath, stat) => {
          if (filter.isAccepted(path.fullPath(relPath))) {
            return path.newFile(relPath, {stat: stat})
          }
        })
        .filter(R.is(Object))
    }

    const addFilesStream = createFileStream('add')
    const removedFileStream = createFileStream('unlink')

    const changedFileStream = Bacon
      .mergeAll(
        createFileStream('change').debounce(200),
        addFilesStream
          .flatMap(file => Bacon
            .fromNodeCallback(fs.readFile, file.path, 'utf8')
            .map(data => path.newFile(file.relPath, {
              stat: file.stat,
              content: data
            }))),
        addFilesStream
          .filter(file => !file.createdTime)
          .flatMap(file => Bacon
            .fromNodeCallback(fs.stat, file.path)
            .map(stat => path.newFile(file.relPath, {
              stat: stat,
              content: file.content
            }))))

    const initialScanDoneProp = Bacon
      .fromEvent(chokidarWatch, 'ready')
      .map(true)
      .toProperty(false)

    const filesProp = Bacon
      .update(
        [],
        [addFilesStream], (files, newFile) => {
          files.push(newFile)
          return files
        },
        [changedFileStream], (files, newFile) => {
          return files.map(oldFile => {
            return newFile.relPath === oldFile.relPath
              ? newFile
              : oldFile
          })
        },
        [removedFileStream], (files, removedFile) => {
          return files.filter(oldFile => oldFile.relPath !== removedFile.relPath)
        }
      )

    disposables.add( // Make sure to have listeners from start to not miss any initial events
      initialScanDoneProp.onValue(() => {}),
      filesProp.onValue(() => {})
    )

    return {
      initialScanDoneProp: () => initialScanDoneProp,
      filesProp: () => filesProp,

      dispose: () => {
        disposables.dispose()
        chokidarWatch.close()
      }
    }
  }
}
