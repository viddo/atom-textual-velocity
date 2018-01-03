/* @flow */

import type { Note } from "../flow-types/Note";

export default class StatsDateField {
  notePropName: string;
  _statsPropName: string;

  value: void | ((note: Note, filename: string) => any);

  constructor(params: { notePropName: string, statsPropName: string }) {
    this.notePropName = params.notePropName;
    this._statsPropName = params.statsPropName;
  }

  value(note: Note): any {
    const { stats } = note;
    if (stats) {
      // $FlowFixMe because _statsPropName could be birthtime which might not exist
      const date = stats[this._statsPropName];
      if (date) {
        return date.getTime();
      }
    }
  }
}
