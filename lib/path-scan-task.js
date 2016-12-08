/* @flow */
/* global emit */
import chokidar from 'chokidar'

export default function (dir: string, chokidarOpts: Object) {
  const that: any = this // flowtype fix: this.async is available on global process object when invoked from a Atom Task runner.
  const terminate = that.async()

  const chokidarWatch = chokidar.watch(dir, chokidarOpts)

  chokidarWatch.on('add', (filename, stats) => {
    emit('add', filename, stats)
  })

  chokidarWatch.on('ready', () => {
    chokidarWatch.close()
    emit('done')
    terminate()
  })

  process.on('message', () => {
    chokidarWatch.close() // make sure to cleanup if process is terminated
  })
}
