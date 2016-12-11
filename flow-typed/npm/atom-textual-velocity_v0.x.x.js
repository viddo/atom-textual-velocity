type Action =
  | StartInitialScan
  | ScannedFile
  | InitialScanDone
  | Scrolled
  | Dispose
type StartInitialScan = {
  type: 'START_INITIAL_SCAN'
}
type ScannedFile = {
  type: 'SCANNED_FILE',
  rawFile: RawFile
}
type InitialScanDone = {
  type: 'INITIAL_SCAN_DONE'
}
type Scrolled = {
  type: 'SCROLLED',
  scrollTop: number
}
type Dispose = {
  type: 'DISPOSE'
}

type Config = {
  dir: string,
  listHeight: number,
  rowHeight: number,
  sortDirection: string,
  sortField: string
}
type InitialScan = {
  done: boolean,
  rawFiles: Array<RawFile>
}
type Notes = any
type Pagination = {
  start: number,
  limit: number
}
type Row = {
  id: string,
  filename: string,
  selected: boolean,
  cells: Array<CellType|EditCellType>
}
type State = {
  columns: Array<{
    title: string,
    width: number
  }>,
  config: Config,
  initialScan: InitialScan,
  notes: Notes,
  pagination: Pagination,
  query: string,
  visibleRows: Array<Row>
}

type FsStats =
  | (fs.Stats & {
    mtime: Date,
    birthtime?: Date
  })


type RawFile = {
  filename: string,
  stats: FsStats
}

type NoteField = {
  notePropName: string,
  value?: (note: any, filename: string) => any
}

type NotesFields = {
  add (field: NoteField): void,
  propNames (): Array<string>,
  all (): Array<NoteField>
}

type Columns = {
  add (column: Column): void,
  all (): Array<Column>
}
type Column = {
  cellContent (params: CellContentParamsType): CellContentType,
  description: string,
  editCellName?: string,
  editCellStr?: (note: NoteType) => string,
  position?: number,
  sortField: string,
  title: string,
  width: number
}
