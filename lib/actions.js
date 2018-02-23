/* @flow */
import type { SortDirection } from "sifter";
import type { FileReadResult, RawFile } from "./flow-types/File";
import type { NotePropName } from "./flow-types/Note";

export type Action =
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
  | EditCellDone
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
  | SelectPrev;

export const CHANGED_ACTIVE_PANE_ITEM = "CHANGED_ACTIVE_PANE_ITEM";
type ChangedActivePaneItem = {
  type: "CHANGED_ACTIVE_PANE_ITEM",
  path: ?string
};
export function changedActivePaneItem(path: ?string): ChangedActivePaneItem {
  return {
    type: CHANGED_ACTIVE_PANE_ITEM,
    path
  };
}

export const CHANGED_HIDDEN_COLUMNS = "CHANGED_HIDDEN_COLUMNS";
type ChangedHiddenColumns = {
  type: "CHANGED_HIDDEN_COLUMNS",
  hiddenColumns: string[]
};
export function changeHiddenColumns(
  hiddenColumns: string[]
): ChangedHiddenColumns {
  return {
    type: CHANGED_HIDDEN_COLUMNS,
    hiddenColumns
  };
}

export const CHANGED_LIST_HEIGHT = "CHANGED_LIST_HEIGHT";
type ChangedListHeight = {
  type: "CHANGED_LIST_HEIGHT",
  listHeight: number
};
export function changeListHeight(listHeight: number): ChangedListHeight {
  return {
    type: CHANGED_LIST_HEIGHT,
    listHeight
  };
}

export const CHANGED_ROW_HEIGHT = "CHANGED_ROW_HEIGHT";
type ChangedRowHeight = {
  type: "CHANGED_ROW_HEIGHT",
  rowHeight: number
};
export function changeRowHeight(rowHeight: number): ChangedRowHeight {
  return {
    type: CHANGED_ROW_HEIGHT,
    rowHeight
  };
}

export const CHANGED_SORT_DIRECTION = "CHANGED_SORT_DIRECTION";
type ChangedSortDirection = {
  type: "CHANGED_SORT_DIRECTION",
  sortDirection: SortDirection
};
export function changeSortDirection(
  sortDirection: SortDirection
): ChangedSortDirection {
  return {
    type: CHANGED_SORT_DIRECTION,
    sortDirection
  };
}

export const CHANGED_SORT_FIELD = "CHANGED_SORT_FIELD";
type ChangedSortField = {
  type: "CHANGED_SORT_FIELD",
  sortField: string
};
export function changeSortField(sortField: string): ChangedSortField {
  return {
    type: CHANGED_SORT_FIELD,
    sortField
  };
}

export const DISPOSE = "DISPOSE";
type Dispose = { type: "DISPOSE" };
export function dispose(): Dispose {
  return { type: DISPOSE };
}

export const EDIT_CELL = "EDIT_CELL";
type EditCell = {
  type: "EDIT_CELL",
  name: NotePropName
};
export function editCell(name: NotePropName): EditCell {
  return {
    type: EDIT_CELL,
    name
  };
}

export const EDIT_CELL_ABORT = "EDIT_CELL_ABORT";
type EditCellAbort = { type: "EDIT_CELL_ABORT" };
export function editCellAbort(): EditCellAbort {
  return { type: EDIT_CELL_ABORT };
}

export const EDIT_CELL_SAVE = "EDIT_CELL_SAVE";
type EditCellSave = {
  type: "EDIT_CELL_SAVE",
  value: string
};
export function editCellSave(value: string): EditCellSave {
  return {
    type: EDIT_CELL_SAVE,
    value
  };
}
export const EDIT_CELL_DONE = "EDIT_CELL_DONE";
type EditCellDone = { type: "EDIT_CELL_DONE" };
export function editCellDone(): EditCellDone {
  return { type: EDIT_CELL_DONE };
}

export const FILE_ADDED = "FILE_ADDED";
type FileAdded = {
  type: "FILE_ADDED",
  rawFile: RawFile
};
export function fileAdded(rawFile: RawFile): FileAdded {
  return {
    type: FILE_ADDED,
    rawFile
  };
}

export const FILE_CHANGED = "FILE_CHANGED";
type FileChanged = {
  type: "FILE_CHANGED",
  rawFile: RawFile
};
export function fileChanged(rawFile: RawFile): FileChanged {
  return {
    type: FILE_CHANGED,
    rawFile
  };
}

export const FILE_DELETED = "FILE_DELETED";
type FileDeleted = {
  type: "FILE_DELETED",
  filename: string
};
export function fileDeleted(filename: string): FileDeleted {
  return {
    type: FILE_DELETED,
    filename
  };
}

export const FILE_FOUND = "FILE_FOUND";
type FileFound = {
  type: "FILE_FOUND"
};
export function fileFound(): FileFound {
  return { type: FILE_FOUND };
}

export const FILE_READ = "FILE_READ";
type FileRead = { type: "FILE_READ" } & FileReadResult;
export function fileRead(result: FileReadResult): FileRead {
  return {
    type: FILE_READ,
    ...result
  };
}

export const FILE_READ_FAILED = "FILE_READ_FAILED";
export type FileReadFailedParams = {
  filename: string,
  notePropName: NotePropName
};
type FileReadFailed = { type: "FILE_READ_FAILED" } & FileReadFailedParams;
export function fileReadFailed(meta: FileReadFailedParams): FileReadFailed {
  return {
    type: FILE_READ_FAILED,
    ...meta
  };
}

export const FILE_RENAMED = "FILE_RENAMED";
type FileRenamed = {
  type: "FILE_RENAMED",
  filename: string,
  oldFilename: string
};
export function fileRenamed(filenames: {
  filename: string,
  oldFilename: string
}): FileRenamed {
  return {
    type: FILE_RENAMED,
    ...filenames
  };
}

export const READ_DIR_DONE = "READ_DIR_DONE";
export type ReadDirDone = {
  type: "READ_DIR_DONE",
  rawFiles: RawFile[]
};
export function readDirDone(rawFiles: RawFile[]): ReadDirDone {
  return {
    type: READ_DIR_DONE,
    rawFiles
  };
}

export const OPEN_NOTE = "OPEN_NOTE";
type OpenNote = { type: "OPEN_NOTE" };
export function openNote(): OpenNote {
  return { type: OPEN_NOTE };
}

export const READ_FILES_DONE = "READ_FILES_DONE";
type ReadFilesDone = { type: "READ_FILES_DONE" };
export function readFilesDone(): ReadFilesDone {
  return { type: READ_FILES_DONE };
}

export const RESET_SEARCH = "RESET_SEARCH";
type ResetSearch = { type: "RESET_SEARCH" };
export function resetSearch(): ResetSearch {
  return { type: RESET_SEARCH };
}

export const RESIZED_LIST = "RESIZED_LIST";
type ResizedList = {
  type: "RESIZED_LIST",
  listHeight: number
};
export function resizeList(listHeight: number): ResizedList {
  return {
    type: RESIZED_LIST,
    listHeight
  };
}

export const SCROLLED = "SCROLLED";
type Scrolled = {
  type: "SCROLLED",
  scrollTop: number
};
export function scroll(scrollTop: number): Scrolled {
  return {
    type: SCROLLED,
    scrollTop
  };
}

export const SEARCH = "SEARCH";
type Search = {
  type: "SEARCH",
  query: string
};
export function search(query: string): Search {
  return {
    type: SEARCH,
    query
  };
}

export const SELECT_NEXT = "SELECT_NEXT";
type SelectNext = { type: "SELECT_NEXT" };
export function selectNext(): SelectNext {
  return { type: SELECT_NEXT };
}

export const SELECT_NOTE = "SELECT_NOTE";
type SelectNote = {
  type: "SELECT_NOTE",
  filename: string
};
export function selectNote(filename: string): SelectNote {
  return {
    type: SELECT_NOTE,
    filename
  };
}

export const SELECT_PREV = "SELECT_PREV";
type SelectPrev = { type: "SELECT_PREV" };
export function selectPrev(): SelectPrev {
  return { type: SELECT_PREV };
}
