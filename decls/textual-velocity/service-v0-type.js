declare type ServiceV0Type = {
  registerColumns (...items: Array<ColumnType>): void,
  registerFields (...items: Array<FieldType>): void,
  registerFileReaders (...items: Array<FileReaderType>): void,
  deregisterFileReaders (...items: Array<FileReaderType>): void,
  registerFileWriters (...items: Array<FileWriterType>): void,
  editCell (editCellName: string): void
}
