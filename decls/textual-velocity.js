/* @flow */
/* eslint-disable */

import fs from 'fs'
import Bacon from 'baconjs'

declare type CellContentType = string | {attrs: Object, content: CellContentType} | Array<CellContentType>

declare type ColumnHeaderType = {
  id: string,
  title: string,
  sortField: string,
  width: number
}

declare type ColumnType = {
  id: string,
  title: string,
  width: number,
  field: string,
  cellContent: (file: NotesFileType, res: RawSearchResultsType) => CellContentType
}

declare type DisposableType = {
  add: (obj: Function | {dispose: Function}) => void,
  dispose: Function
}

declare type FsStatsType = (fs.Stats & {birthtime: Date | void}) | {}

declare type InteractorType = {
  startSession: (req: SessionType) => void,
  search: (str: string) => void,
  paginate: (pagination: PaginationType) => void,
  selectByIndex: (index: number) => void,
  selectByPath: (path: string) => void,
  selectPrev: Function,
  selectNext: Function,
  openOrCreateItem: Function,
  sortByField: (field: string) => void,
  sortDirection: (direction: SortDirectionType) => void,
  stopSession: Function
}

declare type PresenterType = {
  presentLoading: Function,
  presentSearchResults: (res: RawSearchResultsType) => void,
  presentSelectedFilePreview: (file: NotesFileType) => void,
  presentSelectedFileContent: (file: NotesFileType) => void,
  presentNewFile: (file: NotesFileType) => void
}

declare type LoadingParamsType = {
  DOMNode: HTMLElement,
  listHeight: number
}

declare type NotesFileType = {
  id: string,
  relPath: string,
  path: string,
  name: string,
  ext: string,
  createdTime: number | void,
  lastUpdatedTime: number | void,
  stats: FsStatsType,
  content: string | void
}

declare type NotesFileOptionsType = {
  stats: FsStatsType | void,
  content: string | void
}

declare type NotesPathType = {
  root: string,
  fullPath: (relPath: string) => string,
  newFile: (relPath: string, options?: NotesFileOptionsType) => NotesFileType
}

declare type NotesPathFilterType = {
  isAccepted: (path: string) => boolean
}

declare type PathWatcherType = {
  initialScanDoneProp: Bacon.Property,
  filesProp: Bacon.Property,
  dispose: Function
}

declare type PathWatcherFactoryType = {
  watch: (path: NotesPathType, filter: NotesPathFilterType) => PathWatcherType
}

declare type PaginationType = {start: number, limit: number}

declare type RawSearchResultsType = {
  files: Array<NotesFileType>,
  sifterResult: SifterResultType,
  pagination: PaginationType,
  selectedIndex: number | void
}

declare type RendererType = {
  renderLoading: (viewModel: LoadingParamsType) => void,
  renderResults: (viewModel: ResultsViewParamsType) => void,
  remove: (DOMNode: HTMLElement) => void
}

declare type ResultsViewParamsType = {
  DOMNode: HTMLElement,
  rowHeight: number,
  listHeight: number,
  forcedScrollTop: number | void,
  res: SearchResultsType,
  callbacks: Object
}

declare type SearchResultsType = {
  selectedIndex: number | void,
  searchStr: string,
  paginationStart: number,
  itemsCount: number,
  sort: SifterResultSortType,
  columns: Array<ColumnHeaderType>,
  rows: Array<{
    id: string,
    index: number,
    selected: boolean,
    cells: Array<CellContentType>
  }>
}

declare type SifterResultType = {
  items: Array<Object>,
  options: {
    fields: Array<string>,
    sort: Array<SifterResultSortType>,
    limit?: number | void
  },
  total: number
}

declare type SifterResultSortType = {
  field: string,
  direction: SortDirectionType
}

declare type SessionType = {
  ignoredNames: string,
  excludeVcsIgnoredPaths: string,
  rootPath: string,
  sortField: string,
  sortDirection: SortDirectionType,
  paginationLimit: number
}

declare type SortDirectionType = 'asc' | 'desc'

declare type ViewCtrlType = {
  // interactor: Interactor,
  activate: Function,
  displayLoading: Function,
  displaySearchResults: (viewModel: SearchResultsType) => void,
  displaySelectedItemPreview: (path: string) => void,
  displayItemContent: (path: string) => void,
  deactivate: Function
}
