type Action =
  | StartInitialScan
  | ScannedFile
  | InitialScanDone
  | Search
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
type Search = {
  type: 'SEARCH',
  query: string
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
  cells: Array<Cell>
}
type Cell = {
  content: CellContentType
}
type State = {
  columns: Array<{
    title: string,
    width: number
  }>,
  config: Config,
  forcedScrollTop: ?number,
  initialScan: InitialScan,
  notes: Notes,
  pagination: Pagination,
  sifterResult: SifterResult,
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

type SifterResult = {
  items: Array<{
    id: string,
    score: number
  }>,
  options: {
    fields: Array<string>,
    limit?: number | void,
    sort: Array<{
      direction: string,
      field: string
    }>
  },
  query: string,
  tokens: Array<{
    string: string,
    regex: RegExp
  }>,
  total: number
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
