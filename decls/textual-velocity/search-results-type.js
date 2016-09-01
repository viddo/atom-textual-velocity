declare type SearchResultsType = {
  files: Array<NotesFileType>,
  sifterResult: SifterResultType,
  pagination: PaginationType,
  selectedIndex: number | void
}
