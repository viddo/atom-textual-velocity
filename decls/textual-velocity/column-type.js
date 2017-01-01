declare type ColumnType = {
  cellContent (params: CellContentParamsType): CellContentType,
  className?: string,
  description: string,
  editCellName?: string,
  editCellStr?: (note: NoteType) => string,
  sortField: string,
  title: string,
  width: number
}
