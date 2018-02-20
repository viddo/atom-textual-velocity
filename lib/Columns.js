/* @flow */

import NVtags from "./NVtags";
import * as C from "./constants";
import { RENAME_CELL_NAME } from "./epics/renameNoteEpic";
import FileIconColumn from "./columns/FileIconColumn";
import StatsDateColumn from "./columns/StatsDateColumn";
import SummaryColumn from "./columns/SummaryColumn";
import NVtagsColumn from "./NVtags/NVtagsColumn";
import type { ColumnHeader } from "./flow-types/ColumnHeader";
import type { IColumn } from "./flow-types/IColumn";

export function name(column: ColumnHeader) {
  return column.title.toLowerCase().replace(/\s/, "-");
}

const columns: IColumn[] = [
  new FileIconColumn({ sortField: C.EXT_FIELD }),
  new SummaryColumn({
    sortField: C.NAME_FIELD,
    editCellName: RENAME_CELL_NAME
  })
];
if (!NVtags.unsupportedError) {
  columns.push(new NVtagsColumn());
}
columns.push(
  new StatsDateColumn({
    title: "Last updated",
    description: "Last updated date",
    notePropName: "mtime",
    sortField: C.LAST_UPDATE_FIELD
  }),
  new StatsDateColumn({
    title: "Created",
    description: "Created date",
    notePropName: "birthtime",
    sortField: C.BIRTHTIME_FIELD
  })
);

export default columns;

export function patchColumnsForTest(...replacements: Function[]) {
  let original: any;

  beforeEach(() => {
    original = columns.slice(0);
    columns.length = 0;
    replacements.forEach(fn => {
      const fakeColumn = fn();
      columns.push(fakeColumn);
    });
  });

  afterEach(() => {
    columns.length = 0;
    original.forEach(x => columns.push(x));
    original = null;
  });
}
