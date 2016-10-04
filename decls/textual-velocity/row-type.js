declare type RowType = {
  id: string,
  filename: number,
  selected: boolean,
  cells: Array<CellType|EditCellType>
}
