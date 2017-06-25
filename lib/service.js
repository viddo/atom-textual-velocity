/* @flow */

const privates = new WeakMap();

export default class Service {
  constructor(
    columns: Columns,
    fileReaders: FileReaders,
    fileWriters: FileWriters,
    noteFields: NoteFields
  ) {
    privates.set(this, { columns, fileReaders, fileWriters, noteFields });
  }

  registerColumns(...items: Array<Column>) {
    const { columns } = privates.get(this) || {};
    items.forEach(item => {
      columns.add(item);
    });
  }

  registerFields(...items: Array<NoteField>) {
    const { noteFields } = privates.get(this) || {};
    items.forEach(item => {
      noteFields.add(item);
    });
  }

  registerFileReaders(...items: Array<FileReader>) {
    const { fileReaders } = privates.get(this) || {};
    items.forEach(item => {
      fileReaders.add(item);
    });
  }

  deregisterFileReaders(...items: Array<FileReader>) {
    const { fileReaders } = privates.get(this) || {};
    items.forEach(item => {
      fileReaders.remove(item);
    });
  }

  registerFileWriters(...items: Array<FileWriter>) {
    const { fileWriters } = privates.get(this) || {};
    items.forEach(item => {
      fileWriters.add(item);
    });
  }

  dispose() {
    privates.delete(this);
  }
}
