/* @flow */

import type {
  CellContent,
  CellContentParams
} from "../../flow-types/CellContent";
import type { IColumn } from "../../flow-types/IColumn";
import type { Note, NotePropName } from "../../flow-types/Note";
import type { SearchMatch } from "../../flow-types/SearchMatch";

const MAX_PREVIEW_LENGTH = 400; // characters
const HIGHLIGHT_PREVIEW_PADDING_LENGTH = 20; // characters

export default class SummaryColumn implements IColumn {
  className: string;
  description: string;
  editCellName: NotePropName;
  sortField: NotePropName;
  title: string;
  width: number;

  constructor() {
    this.className = "summary";
    this.description = "File name and content preview";
    this.editCellName = "name";
    this.sortField = "name";
    this.title = "Summary";
    this.width = 48;
  }

  editCellStr(note: Note) {
    return note.name + note.ext;
  }

  cellContent(params: CellContentParams): CellContent {
    const { note, searchMatch } = params;
    return [
      (searchMatch && searchMatch.content(note.name)) || note.name,
      { content: note.ext, attrs: { className: "text-subtle" } },
      " - ",
      this._preview(note, searchMatch)
    ];
  }

  _preview(note: Note, searchMatch?: SearchMatch): Object {
    const str = note.content;
    let content;

    if (str) {
      content = searchMatch && searchMatch.content(str);
      if (content) {
        const highlightStart = str.indexOf(content[1].content);
        const highlightLength = content[1].content.length;
        const prefixLength = highlightStart - HIGHLIGHT_PREVIEW_PADDING_LENGTH;
        const prefixStart = Math.max(0, prefixLength);
        const prefix =
          (prefixStart > 0 ? "…" : "") +
          content[0].slice(prefixStart, highlightStart);
        const suffix = content[2].slice(
          0,
          Math.max(0, MAX_PREVIEW_LENGTH - (prefix.length + highlightLength))
        );
        content[0] = prefix;
        content[2] = suffix;
      }
    }

    return {
      attrs: { className: "text-subtle" },
      content: content || (str && str.slice(0, MAX_PREVIEW_LENGTH))
    };
  }
}
