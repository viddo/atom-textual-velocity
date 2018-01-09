/* @flow */
import type { Note } from "./Note";
import type { SearchMatch, SearchMatchContent } from "./SearchMatch";

export type CellContent =
  | string
  | {
      attrs: Object,
      content?: CellContent
    }
  | Array<CellContent>
  | SearchMatchContent
  | void;

export type CellContentParams = {
  note: Note,
  path: string,
  searchMatch?: SearchMatch
};
