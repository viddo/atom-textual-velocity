declare type ColumnType = {
  editCellName?: string,
  sortField: string,
  title: string,
  description: string,
  width: number,
  editCellStr?: void | (file: NotesFileType) => string,
  cellContent (file: NotesFileType, searchMatch?: SearchMatchType): CellContentType
}
