declare type RowType = {
  id: string,
  relPath: number,
  selected: boolean,
  cells: Array<CellType|EditCellType>
}
