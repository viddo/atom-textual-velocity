type Action =
  | ChangedActivePaneItem
  | ChangedListHeight
  | ChangedRowHeight
  | ChangedSortDirection
  | ChangedSortField
  | ClickRow
  | Dispose
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

type CellType = {
  className: string|void,
  content: CellContent
}

type CellContent =
  | string
  | {
      attrs: Object,
      content?: CellContent
    }
  | Array<CellContent>

type CellContentParams = {
  note: Note,
  path: string,
  searchMatch?: SearchMatch
}

type ChangedActivePaneItem = {
  type: 'CHANGED_ACTIVE_PANE_ITEM',
  path: ?string
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
  map<T> (mapper: (column: Column) => T): Array<T>
}
type ColumnHeader = {
  sortField: string,
  title: string,
  width: number
}

type Dispose = {
  type: 'DISPOSE'
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
  initialScanDone: boolean,
  initialScanFilesCount: number,
  itemsCount: number,
  listHeight: number,
  paginationStart: number,
  query: string,
  readyCount: number,
  rowHeight: number,
  scrollTop: number,
  sortDirection: SortDirection,
  sortField: string,
  totalCount: number,
  visibleRows: Array<VisibleRow>
}
type MainPropsActions = {
  actions: {
    changeRowHeight: Function,
    changeSortDirection: Function,
    changeSortField: Function,
    clickRow: Function,
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
  propNames (): Array<string>,
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

type Scrolled = {
  type: 'SCROLLED',
  scrollTop: number
}

type Search = {
  type: 'SEARCH',
  query: string
}

type SearchMatch = {
  content (str: string): [string, Object, string] | void
}

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
  initialScan: InitialScan,
  listHeight: number,
  notes: Notes,
  rowHeight: number,
  scrollTop: number,
  selectedNote: ?SelectedNote,
  sifterResult: SifterResult
}

type SortDirection = 'desc' | 'asc'

type VisibleRow = {
  cells: Array<CellType>,
  filename: string,
  id: string,
  selected: boolean
}
