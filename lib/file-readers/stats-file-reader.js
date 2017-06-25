/* @flow */

export default {
  notePropName: "stats",

  read(path: string, stats: FsStats, callback: NodeCallback) {
    callback(null, stats);
  }
};
