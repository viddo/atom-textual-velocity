/* @flow */

import type { CellContentParams } from "../../flow-types/CellContent";
import type { Note, NotePropName } from "../../flow-types/Note";
import type { IColumn } from "../../flow-types/IColumn";

export default class NVtagsColumn implements IColumn {
  className: string;
  description: string;
  editCellName: NotePropName;
  sortField: NotePropName;
  title: string;
  width: number;

  constructor() {
    this.className = "nv-tags";
    this.description = "NV Tags";
    this.editCellName = "nvtags";
    this.sortField = "nvtagstr";
    this.title = "NV Tags";
    this.width = 20;
  }

  editCellStr(note: Note) {
    const tags = note.nvtags || [];
    return tags.join(" ");
  }

  cellContent(params: CellContentParams) {
    const tags = params.note.nvtags;
    if (Array.isArray(tags)) {
      var searchMatch = params.searchMatch;
      return tags.map((tag) => {
        return {
          attrs: { className: "inline-block-tight highlight" },
          content: (searchMatch && searchMatch.content(tag)) || tag,
        };
      });
    }
  }
}
