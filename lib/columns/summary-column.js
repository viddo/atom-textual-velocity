/* @flow */

const MAX_PREVIEW_LENGTH = 400; // characters
const HIGHLIGHT_PREVIEW_PADDING_LENGTH = 20; // characters

export default class SummaryColumn {
  className: string | void;
  description: string;
  editCellName: string | void;
  editCellStr: void | ((note: Note) => string);
  sortField: string;
  title: string;
  width: number;

  constructor(params: { editCellName: string, sortField: string }) {
    this.className = "summary";
    this.description = "File name and content preview";
    this.editCellName = params.editCellName;
    this.sortField = params.sortField;
    this.title = "Summary";
    this.width = 48;
  }

  editCellStr(note: Note): string {
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
        const highlightEnd = content[1].content.length;
        const start = Math.max(
          0,
          highlightStart - HIGHLIGHT_PREVIEW_PADDING_LENGTH
        );
        content[0] =
          (start > 0 ? "…" : "") + content[0].slice(start, highlightStart);
        content[2] = content[2].slice(
          0,
          Math.max(0, MAX_PREVIEW_LENGTH - (highlightStart + highlightEnd))
        );
      }
    }

    return {
      attrs: { className: "text-subtle" },
      content: content || (str && str.slice(0, MAX_PREVIEW_LENGTH))
    };
  }
}
