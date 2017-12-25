import type fs from 'fs'

type Action =
  | ChangedActivePaneItem
  | ChangedHiddenColumns
  | ChangedListHeight
  | ChangedRowHeight
  | ChangedSortDirection
  | ChangedSortField
  | Dispose
  | EditCell
  | EditCellAbort
  | EditCellSave
  | FileAdded
  | FileChanged
  | FileDeleted
  | FileFound
  | FileRead
  | FileReadFailed
  | FileRenamed
  | ReadDirDone
  | OpenNote
  | ReadFilesDone
  | ResetSearch
  | ResizedList
  | Scrolled
  | Search
  | SelectNext
  | SelectNote
  | SelectPrev

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

type SelectNote = {
  type: 'SELECT_NOTE',
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
type FileFound = {
  type: 'FILE_FOUND'
}
type FileRenamed = {
  type: 'FILE_RENAMED',
  filename: string,
  oldFilename: string
}
type FileRead = {type: 'FILE_READ'} & FileReadResult
type FileReadResult = {
  filename: string,
  notePropName: string,
  value: any
}
type FileReadFailed = {type: 'FILE_READ_FAILED'} & FileReadFailedParams
type FileReadFailedParams = {
  filename: string,
  notePropName: string
}
type FileReadFails = {[filename: string]: string[]}

type FileReader = {
  notePropName: string,
  read (path: string, fileStats: fs.Stats, callback: NodeCallback): void
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

type ReadDirDone = {
  type: 'READ_DIR_DONE',
  rawFiles: RawFile[]
}

type KeyPressEvent = {
  keyCode: number,
  preventDefault: Function
}

type LoadingState =
  | ReadDirLoadingState
  | ReadingFilesLoadingState
  | DoneLoadingState
type ReadDirLoadingState = {
  status: 'readDir',
  filesCount: number
}
type ReadingFilesLoadingState = {
  status: 'readingFiles',
  readyCount: number,
  totalCount: number
}
type DoneLoadingState = {
  status: 'done'
}

type NodeCallback = (err: ?Object|void, result: any) => void

type Note = {
  id: string,
  name: string,
  ext: string,
  stats: fs.Stats,
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
class NotesFileFilter {
  isAccepted: (rawFile: RawFile | string) => bool
}

type OpenNote = {
  type: 'OPEN_NOTE'
}

type Pagination = {
  start: number,
  limit: number
}

type ProcessInTesting = {
  watcher?: atom$PathWatcher,
  store?: Store
}

type RawFile = {
  filename: string,
  stats: fs.Stats
}
type RenamedFile = {
  filename: string,
  oldFilename? :string
}

type ReadFilesCount = {
  type: 'READ_FILES_COUNTS',
  readyCount: number,
  totalCount: number
}
type ReadFilesDone = {
  type: 'READ_FILES_DONE'
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

type State = {
  columnHeaders: Array<ColumnHeader>,
  dir: string,
  editCellName: EditCellName,
  fileReadFails: FileReadFails,
  listHeight: number,
  loading: LoadingState,
  notes: Notes,
  queryOriginal: string,
  rowHeight: number,
  scrollTop: number,
  selectedNote: ?SelectedNote,
  sifterResult: SifterResult
}

type SortDirection = 'desc' | 'asc'
