/* @flow */

import type fs from "fs";
import type { RowCell } from "./RowCell";

export type Note = {
  id: string,
  name: string,
  ext: string,
  stats: fs.Stats,

  // known fields that will exist once a FileReader and/or NoteField value is read
  birthtime?: number,
  content?: string,
  fileIcons?: string | void,
  mtime?: number,
  nvtags?: string[] | void,
  nvtagstr?: string | void,
  ready?: boolean
};

export type NotePropName = $Keys<Note>;
export type Notes = {
  [filename: string]: Note
};

export type NoteRow = {
  cells: RowCell[],
  filename: string,
  id: string,
  selected: boolean
};
