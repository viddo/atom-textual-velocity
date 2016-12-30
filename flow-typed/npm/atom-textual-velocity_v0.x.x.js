type Action =
  | ChangedListHeight
  | ChangedRowHeight
  | ChangedSortDirection
  | ChangedSortField
  | ClickRow
  | DeselectNote
  | Dispose
  | FileAdded
  | FileChanged
  | FileDeleted
  | InitialScanDone
  | KeyPress
  | ResetSearch
  | ResizedList
  | Scrolled
  | Search
  | SelectNote
  | StartInitialScan

type Cell = {
  content: CellContentType
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
  cellContent (params: CellContentParamsType): CellContentType,
  className?: string,
  description: string,
  editCellName?: string,
  editCellStr?: (note: NoteType) => string,
  position?: number,
  sortField: string,
  title: string,
  width: number
}
type Columns = {
  add (column: Column): void,
  all (): Array<Column>
}
type ColumnHeader = {
  sortField: string,
  title: string,
  width: number
}

type Config = {
  dir: string,
  listHeight: number,
  rowHeight: number,
  sortDirection: SortDirection,
  sortField: string
}

type DeselectNote = {
  type: 'DESELECT_NOTE'
}

type Dispose = {
  type: 'DISPOSE'
}
type Cell = {
  className: string,
  content: CellContentType
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

type KeyPress = {
  type: 'KEY_PRESS',
  event: KeyPressEvent
}

type KeyPressEvent = {
  keyCode: number,
  preventDefault: Function
}

type MainPropsWithoutActions = {
  columnHeaders: Array<ColumnHeader>,
  initialScanDone: boolean,
  initialScanFilesCount: number,
  itemsCount: number,
  listHeight: number,
  paginationStart: number,
  query: string,
  rowHeight: number,
  scrollTop: number,
  sortDirection: SortDirection,
  sortField: string,
  visibleRows: Array<VisibleRow>
}
type MainActions = {
  actions: {
    changeRowHeight: Function,
    changeSortDirection: Function,
    changeSortField: Function,
    clickRow: Function,
    keyPress: Function,
    resizeList: Function,
    scroll: Function,
    search: Function
  }
}
type MainProps = MainPropsWithoutActions & MainActions

type Note = {
  id: string,
  name: string,
  ext: string,
  ready: boolean,
  stats: FsStats,

  // known fields that will exist, eventually
  content?: string
}

type NoteField = {
  notePropName: string,
  value?: (note: any, filename: string) => any
}

type Notes = any

type NotesFields = {
  add (field: NoteField): void,
  propNames (): Array<string>,
  all (): Array<NoteField>
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

type SelectNote = {
  type: 'SELECT_NOTE',
  selectedNote: SelectedNote
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
type SifterResultItem = {
  id: string,
  score: number
}

type StartInitialScan = {
  type: 'START_INITIAL_SCAN'
}

type State = {
  columnHeaders: Array<ColumnHeader>,
  config: Config,
  initialScan: InitialScan,
  notes: Notes,
  pagination: Pagination,
  scrollTop: number,
  selectedNote: ?SelectedNote,
  sifterResult: SifterResult,
  visibleRows: Array<VisibleRow>
}

type SortDirection = 'desc' | 'asc'

type VisibleRow = {
  cells: Array<Cell>,
  filename: string,
  id: string,
  selected: boolean
}
