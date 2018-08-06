/* @flow */

import moment from "moment";

import type {
  CellContent,
  CellContentParams
} from "../../flow-types/CellContent";
import type { IColumn } from "../../flow-types/IColumn";
import type { NotePropName } from "../../flow-types/Note";

export default class StatsDateColumn implements IColumn {
  className: string;
  description: string;
  notePropName: NotePropName;
  sortField: NotePropName;
  title: string;
  width: number;

  constructor(params: {
    description: string,
    notePropName: NotePropName,
    sortField: NotePropName,
    title: string
  }) {
    this.className = "stats";
    this.description = params.description;
    this.notePropName = params.notePropName;
    this.sortField = params.sortField;
    this.title = params.title;
    this.width = 14;
  }

  cellContent(params: CellContentParams): CellContent {
    const { stats } = params.note;
    if (stats) {
      // $FlowFixMe because notePropName could be birthtime which might not exist
      const date = stats[this.notePropName];
      if (date) {
        return moment(date.getTime()).fromNow();
      }
    }
    return "";
  }
}
