declare type FieldType = {
  notePropName: string,
  value?: (note: NoteType, relPath: string) => any
}
