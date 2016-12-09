/* @flow */

const privates = new WeakMap()

export default class Service {

  constructor (notesFields: NotesFieldsType) {
    privates.set(this, {
      notesFields: notesFields
    })
  }

  registerColumns (...items: Array<ColumnType>) {
  }

  registerFields (...items: Array<FieldType>) {
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
