/* @flow */

import Bacon from 'baconjs'
import PropWrapper from './prop-wrapper'

export default class Service {

  columnsP: Bacon.Property
  editCellS: Bacon.Stream
  fieldsP: Bacon.Property
  fileReadersP: Bacon.Property
  fileWritersP: Bacon.Property

  _columns: PropWrapper
  _editCellBus: Bacon.Bus
  _fields: PropWrapper
  _fileReaders: PropWrapper
  _fileWriters: PropWrapper

  constructor () {
    this._columns = new PropWrapper()
    this._fields = new PropWrapper()
    this._fileReaders = new PropWrapper()
    this._fileWriters = new PropWrapper()
    this._editCellBus = new Bacon.Bus()

    this.columnsP = this._columns.prop
    this.editCellS = this._editCellBus
    this.fieldsP = this._fields.prop
    this.fileReadersP = this._fileReaders.prop
    this.fileWritersP = this._fileWriters.prop
  }

  addColumn (column: ColumnType) {
    if (typeof column !== 'object') return logError('column object is required', column)
    if (typeof column.sortField !== 'string') return logError('column.sortField string is required', column)
    if (typeof column.title !== 'string') return logError('column.title string is required', column)
    if (typeof column.cellContent !== 'function') return logError('column.cellContent function is required, was', column)

    this._columns.add(column)
  }

  addField (field: FieldType) {
    if (typeof field !== 'object') return logError('field object is required', field)
    if (typeof field.notePropName !== 'string') return logError('field.notePropName string is required', field)

    this._fields.add(field)
  }

  addFileReader (fileReader: FileReaderType) {
    if (typeof fileReader !== 'object') return logError('fileReader object is required', fileReader)
    if (typeof fileReader.notePropName !== 'string') return logError('fileReader.notePropName string is required', fileReader)
    if (typeof fileReader.read !== 'function') return logError('fileReader.read function is required', fileReader)

    this._fileReaders.add(fileReader)
  }

  addFileWriter (fileWriter: FileWriterType) {
    if (typeof fileWriter !== 'object') return logError('fileWriter object is required', fileWriter)
    if (typeof fileWriter.editCellName !== 'string') return logError('fileWriter.editCellName string is required', fileWriter)
    if (typeof fileWriter.write !== 'function') return logError('fileWriter.write function is required', fileWriter)

    this._fileWriters.add(fileWriter)
  }

  publicAPI (): PublicServiceType {
    const self = this

    return {
      registerColumns (...items: Array<ColumnType>) {
        items.forEach(item => self.addColumn(item))
      },

      registerFields (...items: Array<FieldType>) {
        items.forEach(item => self.addField(item))
      },

      registerFileReaders (...items: Array<FileReaderType>) {
        items.forEach(item => self.addFileReader(item))
      },

      registerFileWriters (...items: Array<FileWriterType>) {
        items.forEach(item => self.addFileWriter(item))
      },

      editCell (editCellName: string) {
        self._editCellBus.push(editCellName)
      }
    }
  }

  dispose () {
    this._columns.dispose()
    this._fields.dispose()
    this._fileReaders.dispose()
    this._fileWriters.dispose()
  }
}

function logError (msg, obj) {
  console.error(`${msg}, was ${JSON.stringify(obj)}`)
}
