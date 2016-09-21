declare type ColumnType = {
  editCellName?: string,
  sortField: string,
  title: string,
  description: string,
  width: number,
  editCellStr?: (note: NoteType) => string,
  cellContent (params: CellContentParamsType): CellContentType
}
