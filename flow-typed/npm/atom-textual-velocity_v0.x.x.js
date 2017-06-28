import type fs from 'fs'

type Action =
  | ChangedActivePaneItem
  | ChangedHiddenColumns
  | ChangedListHeight
  | ChangedRowHeight
  | ChangedSortDirection
  | ChangedSortField
  | ClickRow
  | Dispose
  | EditCell
  | EditCellAbort
  | EditCellSave
  | FileAdded
  | FileChanged
  | FileDeleted
  | FileRead
  | InitialScanDone
  | InitialScanRawFilesRead
  | OpenNote
  | ResetSearch
  | ResizedList
  | Scrolled
  | Search
  | SelectNext
  | SelectPrev
  | StartInitialScan

type CellContent =
  | string
  | {
      attrs: Object,
      content?: CellContent
    }
  | Array<CellContent>
  | SearchMatchContent
  | void

type CellContentParams = {
  note: Note,
  path: string,
  searchMatch?: SearchMatch
}

type ChangedActivePaneItem = {
  type: 'CHANGED_ACTIVE_PANE_ITEM',
  path: ?string
}

type ChangedHiddenColumns = {
  type: 'CHANGED_HIDDEN_COLUMNS',
  hiddenColumns: string[]
}

type ChangedListHeight = {
  type: 'CHANGED_LIST_HEIGHT',
  listHeight: number
}
type ChangedRowHeight = {
  type: 'CHANGED_ROW_HEIGHT',
  rowHeight: number
}
type ChangedSortDirection = {
  type: 'CHANGED_SORT_DIRECTION',
  sortDirection: SortDirection
}
type ChangedSortField = {
  type: 'CHANGED_SORT_FIELD',
  sortField: string
}

// see https://github.com/paulmillr/chokidar#api
type ChokidarOptions = {
  alwaysStat?: boolean,
  cwd: string,
  depth?: number,
  ignored?: string,
  persistent?: boolean
}

type ClickRow = {
  type: 'CLICK_ROW',
  filename: string
}

type Column = {
  cellContent (params: CellContentParams): CellContent,
  className?: string,
  description: string,
  editCellName?: string,
  editCellStr?: (note: Note) => string,
  position?: number,
  sortField: string,
  title: string,
  width: number
}
type Columns = {
  add (column: Column): void,
  filter (predicate: (column: Column) => boolean): Column[],
  map<T> (mapper: (column: Column) => T): Array<T>,
  some (predicate: (column: Column) => boolean): boolean
}
type ColumnHeader = {
  sortField: string,
  title: string,
  width: number
}

type Dispose = {
  type: 'DISPOSE'
}

type EditCell = {
  type: 'EDIT_CELL',
  name: string
}
type EditCellAbort = {
  type: 'EDIT_CELL_ABORT'
}
type EditCellName = ?string
type EditCellSave = {
  type: 'EDIT_CELL_SAVE',
  editCellName: string,
  value: string
}

type FileAdded = {
  type: 'FILE_ADDED',
  rawFile: RawFile
}
type FileChanged = {
  type: 'FILE_CHANGED',
  rawFile: RawFile
}
type FileDeleted = {
  type: 'FILE_DELETED',
  filename: string
}
type FileRead = {type: 'FILE_READ'} & FileReadResult
type FileReadResult = {
  filename: string,
  notePropName: string,
  value: any
}

type FileReader = {
  notePropName: string,
  read (path: string, fileStats: FsStats, callback: NodeCallback): void
}
type FileReaders = {
  add (fileReader: FileReader): void,
  remove (fileReader: FileReader): void,
  every (predicate: (fileReader: FileReader) => boolean): boolean,
  filter (predicate: (fileReader: FileReader) => boolean): Array<FileReader>,
  forEach (callback: (fileReader: FileReader) => any): any,
  map<T> (mapper: (fileReader: FileReader) => T): Array<T>
}
type FileWriter = {
  editCellName: string,
  write (path: string, str: string, callback: NodeCallback): void
}
type FileWriters = {
  add (fileWriter: FileWriter): void,
  find (predicate: (fileWriter: FileWriter) => boolean): FileWriter|void
}

type FsStats =
  | (fs.Stats & {
    mtime: Date,
    birthtime?: Date
  })


type InitialScan = {
  done: boolean,
  rawFiles: Array<RawFile>
}
type InitialScanDone = {
  type: 'INITIAL_SCAN_DONE'
}
type InitialScanRawFilesRead = {
  type: 'INITIAL_SCAN_RAW_FILES_READ'
}

type KeyPressEvent = {
  keyCode: number,
  preventDefault: Function
}

type MainProps = MainPropsActions & MainPropsWithoutActions
type MainPropsWithoutActions = {
  columnHeaders: Array<ColumnHeader>,
  editCellName: EditCellName,
  initialScanDone: boolean,
  initialScanFilesCount: number,
  itemsCount: number,
  listHeight: number,
  paginationStart: number,
  queryOriginal: string,
  readyCount: number,
  rowHeight: number,
  scrollTop: number,
  sortDirection: SortDirection,
  sortField: string,
  totalCount: number,
  visibleRows: Array<Row>
}
type MainPropsActions = {
  actions: {
    changeRowHeight: Function,
    changeSortDirection: Function,
    changeSortField: Function,
    clickRow: Function,
    editCell: Function,
    editCellAbort: Function,
    editCellSave: Function,
    keyPress: Function,
    resizeList: Function,
    scroll: Function,
    search: Function
  },
}

type NodeCallback = (err: ?Object|void, result: any) => void

type Note = {
  id: string,
  name: string,
  ext: string,
  stats: FsStats,
  ready?: boolean,

  // known fields that will exist, eventually
  content?: string
}
type Notes = {
  [filename: string]: Note
}
type NoteField = {
  notePropName: string,
  value?: (note: any, filename: string) => any
}
type NoteFields = {
  add (field: NoteField): void,
  forEach (callback: (noteField: NoteField) => any): any,
  map<T> (mapper: (noteField: NoteField) => T): Array<T>
}

type OpenNote = {
  type: 'OPEN_NOTE'
}

type Pagination = {
  start: number,
  limit: number
}

type RawFile = {
  filename: string,
  stats: FsStats
}

type ResizedList = {
  type: 'RESIZED_LIST',
  listHeight: number
}

type ResetSearch = {
  type: 'RESET_SEARCH'
}

type Row = {
  cells: Array<RowCell>,
  filename: string,
  id: string,
  selected: boolean
}
type RowCell = EditRowCell | ReadRowCell
type EditRowCell = {
  type: 'edit',
  editCellStr: string
}
type ReadRowCell = {
  type: 'read',
  className: string,
  content: CellContent,
  editCellName: string|void
}

type Scrolled = {
  type: 'SCROLLED',
  scrollTop: number
}

type Search = {
  type: 'SEARCH',
  query: string
}

type SearchMatch = {
  content (str: string): SearchMatchContent | void
}
type SearchMatchContent = [string, Object, string]

type SelectNext = {
  type: 'SELECT_NEXT'
}
type SelectPrev = {
  type: 'SELECT_PREV'
}
type SelectedNote = {
  index: number,
  filename: string
}

type Service = {
  registerColumns (...items: Array<Column>): void,
  registerFields (...items: Array<NoteField>): void,
  registerFileReaders (...items: Array<FileReader>): void,
  deregisterFileReaders (...items: Array<FileReader>): void,
  registerFileWriters (...items: Array<FileWriter>): void
}

type SifterResult = {
  items: Array<SifterResultItem>,
  options: {
    fields: Array<string>,
    limit?: number | void,
    sort: Array<{
      direction: SortDirection,
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
type SifterResultItem = {
  id: string,
  score: number
}

type StartInitialScan = {
  type: 'START_INITIAL_SCAN'
}

type State = {
  columnHeaders: Array<ColumnHeader>,
  dir: string,
  editCellName: EditCellName,
  initialScan: InitialScan,
  listHeight: number,
  notes: Notes,
  queryOriginal: string,
  rowHeight: number,
  scrollTop: number,
  selectedNote: ?SelectedNote,
  sifterResult: SifterResult
}

type SortDirection = 'desc' | 'asc'
