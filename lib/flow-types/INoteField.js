/* @flow */

import type { Note } from "./Note";

export interface INoteField {
  notePropName: string;
  +value?: (note: Note, filename: string) => any;
}
