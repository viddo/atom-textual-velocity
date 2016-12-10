/* @flow */

const privates = new WeakMap()

export default class Service {

  constructor (columns: Columns, notesFields: NotesFields) {
    privates.set(this, {
      columns: columns,
      notesFields: notesFields
    })
  }

  registerColumns (...items: Array<Column>) {
    const columns = privates.get(this).columns
    items.forEach(item => {
      columns.add(item)
    })
  }

  registerFields (...items: Array<NoteField>) {
    const notesFields = privates.get(this).notesFields
    items.forEach(item => {
      notesFields.add(item)
    })
  }

  registerFileReaders (...items: Array<FileReaderType>) {
  }

  registerFileWriters (...items: Array<FileWriterType>) {
  }

  editCell (editCellName: string) {
  }
}
