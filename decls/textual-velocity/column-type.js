declare type ColumnType = {
  title: string,
  width: number,
  field: string,
  cellContent:
    (
      file: NotesFileType,
      res: SearchResultsType
    ) => CellContentType
}
