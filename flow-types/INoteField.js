/* @flow */

import type { Note, NotePropName } from "./Note";

export interface INoteField {
  notePropName: NotePropName;
  +value?: (note: Note, filename: string) => any;
}
