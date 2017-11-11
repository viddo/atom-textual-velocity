/* @flow */

export default class Service {
  _columns: Columns;
  _fileReaders: FileReaders;
  _fileWriters: FileWriters;
  _noteFields: NoteFields;

  constructor(
    columns: Columns,
    fileReaders: FileReaders,
    fileWriters: FileWriters,
    noteFields: NoteFields
  ) {
    this._columns = columns;
    this._fileReaders = fileReaders;
    this._fileWriters = fileWriters;
    this._noteFields = noteFields;
  }

  registerColumns(...items: Array<Column>) {
    items.forEach(item => {
      this._columns.add(item);
    });
  }

  registerFields(...items: Array<NoteField>) {
    items.forEach(item => {
      this._noteFields.add(item);
    });
  }

  registerFileReaders(...items: Array<FileReader>) {
    items.forEach(item => {
      this._fileReaders.add(item);
    });
  }

  deregisterFileReaders(...items: Array<FileReader>) {
    items.forEach(item => {
      this._fileReaders.remove(item);
    });
  }

  registerFileWriters(...items: Array<FileWriter>) {
    items.forEach(item => {
      this._fileWriters.add(item);
    });
  }

  dispose() {}
}
