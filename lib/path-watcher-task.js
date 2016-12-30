/* @flow */
/* global emit */

import chokidar from 'chokidar'

// Load and watch path in separate task to not block UI thread, especially obvious on initial scan
export default function (dir: string) {
  const that: any = this // flowtype fix: this.async is available on global process object when invoked from a Atom Task runner.
  const terminate = that.async()

  const chokidarWatch = chokidar.watch(dir, {
    ignored: 'node_modules',
    persistent: true,
    depth: 0,
    cwd: dir
  })

  const emitRawFile = (event: string) => (filename: string, stats: FsStats) => {
    const file: RawFile = {filename, stats}
    emit(event, file)
  }

  chokidarWatch.on('add', emitRawFile('add'))
  chokidarWatch.on('change', emitRawFile('change'))
  chokidarWatch.on('unlink', (filename: string) => { emit('unlink', filename) })
  chokidarWatch.on('ready', () => { emit('ready') })

  process.on('message', () => {
    chokidarWatch.close() // make sure to cleanup if process is terminated
    terminate()
  })
}
