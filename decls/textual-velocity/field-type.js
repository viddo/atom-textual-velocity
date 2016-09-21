declare type FieldType = {
  filePropName: string,
  value?: (note: NoteType, relPath: string) => any
}
