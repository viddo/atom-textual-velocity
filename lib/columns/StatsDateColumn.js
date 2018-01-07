/* @flow */

import moment from "moment";
import type { CellContent, CellContentParams } from "../flow-types/CellContent";

export default class StatsDateColumn {
  className: string | void;
  description: string;
  notePropName: string;
  sortField: string;
  title: string;
  width: number;

  constructor(params: {
    sortField: string,
    title: string,
    description: string,
    notePropName: string
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
