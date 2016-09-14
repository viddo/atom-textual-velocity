/* @flow */

import Bacon from 'baconjs'
import PropWrapper from './prop-wrapper'

export default class Service {

  columnsProp: Bacon.Property
  editCellStream: Bacon.Stream
  fieldsProp: Bacon.Property
  fileReadersProp: Bacon.Property
  fileWritersProp: Bacon.Property

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

    this.columnsProp = this._columns.prop
    this.editCellStream = this._editCellBus
    this.fieldsProp = this._fields.prop
    this.fileReadersProp = this._fileReaders.prop
    this.fileWritersProp = this._fileWriters.prop
  }

  addColumn (column: ColumnType) {
    if (!column) return logError('column object is required', column)
    if (!column.sortField) return logError('column.sortField string is required', column)
    if (!column.title) return logError('column.title string is required', column)
    if (typeof column.cellContent !== 'function') return logError('column.cellContent function is required, was', column)

    this._columns.add(column)
  }

  addField (field: FieldType) {
    this._fields.add(field)
  }

  addFileReader (fileReader: FileReaderType) {
    this._fileReaders.add(fileReader)
  }

  addFileWriter (fileWriter: FileWriterType) {
    this._fileWriters.add(fileWriter)
  }

  publicAPI () {
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