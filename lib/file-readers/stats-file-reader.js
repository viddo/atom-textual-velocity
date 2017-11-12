/* @flow */

export default {
  notePropName: "stats",

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    callback(null, stats);
  }
};
