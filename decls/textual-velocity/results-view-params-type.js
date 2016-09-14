declare type ResultsViewParamsType = {
  columns: Array<ColumnHeaderType>,
  forcedScrollTop: number | void,
  itemsCount: number,
  listHeight: number,
  paginationStart: number,
  rowHeight: number,
  rows: Array<{
    id: string,
    index: number,
    selected: boolean,
    cells: Array<CellType>
  }>,
  searchStr: string,
  sort: SifterResultSortType
}
