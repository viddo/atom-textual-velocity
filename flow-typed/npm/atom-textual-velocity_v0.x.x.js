import * as actions from '../../lib/action-creators'

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
    changeRowHeight: typeof actions.changeRowHeight,
    changeSortDirection: typeof actions.changeSortDirection,
    changeSortField: typeof actions.changeSortField,
    keyDown: typeof actions.keyDown,
    resizeList: typeof actions.resizeList,
    scroll: typeof actions.scroll,
    search: typeof actions.changeSortDirection
  }
}

type MainProps = MainPropsWithoutActions & MainActions

type Action =
  | StartInitialScan
  | ScannedFile
  | InitialScanDone
  | Search
  | Scrolled
  | KeyDown
  | SelectPrevNote
  | SelectNextNote
  | ResetSearch
  | ChangedListHeight
  | ChangedRowHeight
  | ChangedSortDirection
  | ChangedSortField
  | ResizedList
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
type KeyDown = {
  type: 'KEY_DOWN',
  event: KeyDownEvent
}
type ResetSearch = {
  type: 'RESET_SEARCH'
}
type SelectNextNote = {
  type: 'SELECT_NEXT_NOTE'
}
type SelectPrevNote = {
  type: 'SELECT_PREV_NOTE'
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
type ResizedList = {
  type: 'RESIZED_LIST',
  listHeight: number
}
type Dispose = {
  type: 'DISPOSE'
}

type SortDirection = 'desc' | 'asc'

type Config = {
  dir: string,
  listHeight: number,
  rowHeight: number,
  sortDirection: SortDirection,
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
type VisibleRow = {
  cells: Array<Cell>,
  filename: string,
  id: string,
  selected: boolean
}
type Cell = {
  className: string,
  content: CellContentType
}
type ColumnHeader = {
  sortField: string,
  title: string,
  width: number
}
type Selected = ?{
  index: number,
  filename: string
}
type State = {
  columnHeaders: Array<ColumnHeader>,
  config: Config,
  initialScan: InitialScan,
  notes: Notes,
  pagination: Pagination,
  scrollTop: number,
  selected: Selected,
  sifterResult: SifterResult,
  visibleRows: Array<VisibleRow>
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

type SifterResultItem = {
  id: string,
  score: number
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
  className?: string,
  description: string,
  editCellName?: string,
  editCellStr?: (note: NoteType) => string,
  position?: number,
  sortField: string,
  title: string,
  width: number
}

type KeyDownEvent = {
  keyCode: number,
  preventDefault: Function
}
