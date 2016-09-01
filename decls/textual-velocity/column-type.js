declare type ColumnType = {
  id: string,
  title: string,
  width: number,
  field: string,
  cellContent:
    (
      file: NotesFileType,
      res: SearchResultsType
    ) => CellContentType
}
