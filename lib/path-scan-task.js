/* @flow */
/* global emit */
import chokidar from 'chokidar'

export default function (dir: string, opts: Object) {
  const that: any = this // flowtype fix: this.async is available on global process object when invoked from a Atom Task runner.
  const terminate = that.async()

  const chokidarWatch = chokidar.watch(dir, opts)

  chokidarWatch.on('add', (filename, stats) => {
    emit('add', filename, stats)
  })

  chokidarWatch.on('ready', () => {
    chokidarWatch.close()
    emit('ready')
    terminate()
  })
}
