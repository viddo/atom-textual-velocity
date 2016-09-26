declare type FieldType = {
  notePropName: string,
  value?: (note: NoteType, filename: string) => any
}
