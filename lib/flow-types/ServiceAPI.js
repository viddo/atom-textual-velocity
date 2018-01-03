/* @flow */

import type { Column } from "./Column";
import type { NoteField } from "./Note";
import type { FileReader, FileWriter } from "./File";

export interface ServiceAPI {
  registerColumns(...items: Array<Column>): void;
  registerFields(...items: Array<NoteField>): void;
  registerFileReaders(...items: Array<FileReader>): void;
  deregisterFileReaders(...items: Array<FileReader>): void;
  registerFileWriters(...items: Array<FileWriter>): void;
}
