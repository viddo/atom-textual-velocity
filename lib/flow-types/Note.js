/* @flow */

import type fs from "fs";
import type { RowCell } from "./RowCell";

export type Note = {
  id: string,
  name: string,
  ext: string,
  stats: fs.Stats,
  ready?: boolean,

  // known fields that will exist, eventually
  content?: string
};

export type Notes = {
  [filename: string]: Note
};

export type NoteRow = {
  cells: RowCell[],
  filename: string,
  id: string,
  selected: boolean
};
