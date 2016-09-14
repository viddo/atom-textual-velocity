declare type ColumnType = {
  editCellName?: string,
  sortField: string,
  title: string,
  description: string,
  width: number,
  cellContent (file: NotesFileType, searchMatch?: SearchMatchType): CellContentType
}
