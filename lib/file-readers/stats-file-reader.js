/* @flow */

export default {

  notePropName: 'stats',

  read (path: string, stats: FsStatsType, callback: NodeCallbackType) {
    callback(null, stats)
  }
}
