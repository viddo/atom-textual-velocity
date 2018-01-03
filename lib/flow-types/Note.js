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

export type NoteField = {
  notePropName: string,
  value?: (note: any, filename: string) => any
};

export type NoteFields = {
  add(field: NoteField): void,
  forEach(callback: (noteField: NoteField) => any): any,
  map<T>(mapper: (noteField: NoteField) => T): Array<T>
};

export type NoteRow = {
  cells: Array<RowCell>,
  filename: string,
  id: string,
  selected: boolean
};
