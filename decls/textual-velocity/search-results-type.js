declare type SearchResultsType = {
  columns: Array<ColumnType>,
  editCellName: string | void,
  notes: Array<Object>,
  notesPath: NotesPathType,
  sifterResult: SifterResultType,
  pagination: PaginationType,
  selectedRelPath?: string
}
