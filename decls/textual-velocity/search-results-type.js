declare type SearchResultsType = {
  columns: Array<ColumnType>,
  editCellName: string | void,
  items: Array<{id: string, score: number}>,
  notes: Object,
  notesPath: NotesPathType,
  pagination: PaginationType,
  searchRegex: RegExp,
  selectedFilename?: string
}
