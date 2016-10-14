declare type RowType = {
  id: string,
  filename: string,
  selected: boolean,
  cells: Array<CellType|EditCellType>
}
