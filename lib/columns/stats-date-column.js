/* @flow */

import moment from "moment";

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
    const { note } = params;
    const date = note.stats && note.stats[this.notePropName];
    return (date && moment(date.getTime()).fromNow()) || "";
  }
}
