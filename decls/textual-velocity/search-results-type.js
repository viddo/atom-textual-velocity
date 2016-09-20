declare type SearchResultsType = {
  columns: Array<ColumnType>,
  editCellName: string | void,
  files: Array<NotesFileType>,
  sifterResult: SifterResultType,
  pagination: PaginationType,
  selectedPath?: string
}
