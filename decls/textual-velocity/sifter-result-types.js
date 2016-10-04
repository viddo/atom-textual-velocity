declare type SifterResultType = {
  items: Array<Object>,
  options: {
    fields: Array<string>,
    sort: Array<SifterResultSortType>,
    limit?: number | void
  },
  total: number
}

declare type SifterResultSortType = {
  field: string,
  direction: SortDirectionType
}
