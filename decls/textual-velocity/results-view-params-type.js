declare type ResultsViewParamsType = {
  columns: Array<ColumnHeaderType>,
  forcedScrollTop: number | void,
  itemsCount: number,
  listHeight: number,
  loadingProgress: {ready: number, total: number},
  paginationStart: number,
  rowHeight: number,
  rows: Array<RowType>,
  searchStr: string,
  sort: SifterResultSortType
}
