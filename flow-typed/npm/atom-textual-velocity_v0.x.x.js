type ActionType =
  | StartInitialScanActionType
  | ScannedFileActionType
  | InitialScanDoneActionType
  | DisposeActionType
type StartInitialScanActionType = {
  type: 'START_INITIAL_SCAN'
}
type ScannedFileActionType = {
  type: 'SCANNED_FILE',
  rawFile: RawFileType
}
type InitialScanDoneActionType = {
  type: 'INITIAL_SCAN_DONE'
}
type DisposeActionType = {
  type: 'DISPOSE'
}

type ColumnStateType = {
  title: string,
  width: number
}
type ConfigStateType = {
  dir: string,
  listHeight: number,
  rowHeight: number,
  sortDirection: string,
  sortField: string
}
type InitialScanStateType = {
  done: boolean,
  rawFiles: Array<RawFileType>
}
type NotesStateType = any
type PaginationStateType = {
  start: number,
  limit: number
}
type RowStateType = {
  id: string,
  filename: string,
  selected: boolean,
  cells: Array<CellType|EditCellType>
}
type StateType = {
  columns: Array<ColumnStateType>,
  config: ConfigStateType,
  initialScan: InitialScanStateType,
  notes: NotesStateType,
  pagination: PaginationStateType,
  query: string,
  rows: Array<RowStateType>
}

type FsStatsType =
  | (fs.Stats & {
    mtime: Date,
    birthtime?: Date
  })


type RawFileType = {
  filename: string,
  stats: FsStatsType
}

type NoteFieldType = {
  notePropName: string,
  value?: (note: any, filename: string) => any
}

type NotesFieldsType = {
  add (field: NoteFieldType): void,
  propNames (): Array<string>,
  all (): Array<NoteFieldType>
}

type ColumnsType = {
  add (column: ColumnType): void,
  all (): Array<ColumnType>
}
