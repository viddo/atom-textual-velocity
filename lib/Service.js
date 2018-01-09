/* @flow */

import type { IColumn } from "./flow-types/IColumn";
import type { IColumns } from "./flow-types/IColumns";
import type { IFileReader } from "./flow-types/IFileReader";
import type { IFileReaders } from "./flow-types/IFileReaders";
import type { IFileWriter } from "./flow-types/IFileWriter";
import type { IFileWriters } from "./flow-types/IFileWriters";
import type { IService } from "./flow-types/IService";
import type { INoteField } from "./flow-types/INoteField";
import type { INoteFields } from "./flow-types/INoteFields";

export default class Service implements IService {
  _columns: IColumns;
  _fileReaders: IFileReaders;
  _fileWriters: IFileWriters;
  _noteFields: INoteFields;

  constructor(
    columns: IColumns,
    fileReaders: IFileReaders,
    fileWriters: IFileWriters,
    noteFields: INoteFields
  ) {
    this._columns = columns;
    this._fileReaders = fileReaders;
    this._fileWriters = fileWriters;
    this._noteFields = noteFields;
  }

  registerColumns(...items: IColumn[]) {
    items.forEach(item => {
      this._columns.add(item);
    });
  }

  registerFields(...items: INoteField[]) {
    items.forEach(item => {
      this._noteFields.add(item);
    });
  }

  registerFileReaders(...items: IFileReader[]) {
    items.forEach(item => {
      this._fileReaders.add(item);
    });
  }

  deregisterFileReaders(...items: IFileReader[]) {
    items.forEach(item => {
      this._fileReaders.remove(item);
    });
  }

  registerFileWriters(...items: IFileWriter[]) {
    items.forEach(item => {
      this._fileWriters.add(item);
    });
  }

  dispose() {}
}
