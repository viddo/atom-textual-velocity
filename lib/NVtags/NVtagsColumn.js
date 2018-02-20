/* @flow */

import * as C from "../constants";
import type { CellContentParams } from "../flow-types/CellContent";
import type { Note } from "../flow-types/Note";
import type { IColumn } from "../flow-types/IColumn";

export default class NVtagsColumn implements IColumn {
  className: string;
  description: string;
  editCellName: string;
  sortField: string;
  title: string;
  width: number;

  constructor() {
    this.className = "nv-tags";
    this.description = "NV Tags";
    this.editCellName = C.NV_TAGS_FILE_PROP_NAME;
    this.sortField = C.NV_TAGS_FIELD_NAME;
    this.title = "NV Tags";
    this.width = 20;
  }

  editCellStr(note: Note) {
    var tags = note[C.NV_TAGS_FILE_PROP_NAME] || [];
    return tags.join(" ");
  }

  cellContent(params: CellContentParams) {
    var tags = params.note[C.NV_TAGS_FILE_PROP_NAME];
    if (Array.isArray(tags)) {
      var searchMatch = params.searchMatch;
      return tags.map(tag => {
        return {
          attrs: { className: "inline-block-tight highlight" },
          content: (searchMatch && searchMatch.content(tag)) || tag
        };
      });
    }
  }
}
