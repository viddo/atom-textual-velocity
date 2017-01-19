declare type ServiceV0Type = {
  registerColumns (...items: Array<Column>): void,
  registerFields (...items: Array<NoteField>): void,
  registerFileReaders (...items: Array<FileReader>): void,
  deregisterFileReaders (...items: Array<FileReader>): void,
  registerFileWriters (...items: Array<FileWriterType>): void
}
