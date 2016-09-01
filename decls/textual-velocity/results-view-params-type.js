declare type ResultsViewParamsType = {
  rowHeight: number,
  listHeight: number,
  forcedScrollTop: number | void,
  selectedIndex: number | void,
  searchStr: string,
  paginationStart: number,
  itemsCount: number,
  sort: SifterResultSortType,
  columns: Array<ColumnHeaderType>,
  rows: Array<{
    id: string,
    index: number,
    selected: boolean,
    cells: Array<CellContentType>
  }>
}
