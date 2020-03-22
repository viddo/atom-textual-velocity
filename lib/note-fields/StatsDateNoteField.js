/* @flow */

import type { INoteField } from "../../flow-types/INoteField";
import type { Note, NotePropName } from "../../flow-types/Note";

type StatsPropName = "birthtime" | "mtime";

export default class StatsDateNoteField implements INoteField {
  notePropName: NotePropName;
  _statsPropName: StatsPropName;

  constructor(params: {
    notePropName: NotePropName,
    statsPropName: StatsPropName,
  }) {
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
