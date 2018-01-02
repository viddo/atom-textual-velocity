/* @flow */
import type { SortDirection } from "sifter";

export const CHANGED_ACTIVE_PANE_ITEM = "CHANGED_ACTIVE_PANE_ITEM";
export const CHANGED_HIDDEN_COLUMNS = "CHANGED_HIDDEN_COLUMNS";
export const CHANGED_LIST_HEIGHT = "CHANGED_LIST_HEIGHT";
export const CHANGED_ROW_HEIGHT = "CHANGED_ROW_HEIGHT";
export const CHANGED_SORT_DIRECTION = "CHANGED_SORT_DIRECTION";
export const CHANGED_SORT_FIELD = "CHANGED_SORT_FIELD";
export const DISPOSE = "DISPOSE";
export const EDIT_CELL = "EDIT_CELL";
export const EDIT_CELL_ABORT = "EDIT_CELL_ABORT";
export const EDIT_CELL_SAVE = "EDIT_CELL_SAVE";
export const FILE_ADDED = "FILE_ADDED";
export const FILE_CHANGED = "FILE_CHANGED";
export const FILE_DELETED = "FILE_DELETED";
export const FILE_FOUND = "FILE_FOUND";
export const FILE_READ = "FILE_READ";
export const FILE_READ_FAILED = "FILE_READ_FAILED";
export const FILE_RENAMED = "FILE_RENAMED";
export const OPEN_NOTE = "OPEN_NOTE";
export const READ_DIR_DONE = "READ_DIR_DONE";
export const READ_FILES_DONE = "READ_FILES_DONE";
export const RESET_SEARCH = "RESET_SEARCH";
export const RESIZED_LIST = "RESIZED_LIST";
export const SCROLLED = "SCROLLED";
export const SEARCH = "SEARCH";
export const SELECT_NEXT = "SELECT_NEXT";
export const SELECT_NOTE = "SELECT_NOTE";
export const SELECT_PREV = "SELECT_PREV";

export function changedActivePaneItem(path: ?string): ChangedActivePaneItem {
  return {
    type: CHANGED_ACTIVE_PANE_ITEM,
    path
  };
}

export function changeHiddenColumns(
  hiddenColumns: string[]
): ChangedHiddenColumns {
  return {
    type: CHANGED_HIDDEN_COLUMNS,
    hiddenColumns
  };
}

export function changeListHeight(listHeight: number): ChangedListHeight {
  return {
    type: CHANGED_LIST_HEIGHT,
    listHeight
  };
}

export function changeRowHeight(rowHeight: number): ChangedRowHeight {
  return {
    type: CHANGED_ROW_HEIGHT,
    rowHeight
  };
}

export function changeSortDirection(
  sortDirection: SortDirection
): ChangedSortDirection {
  return {
    type: CHANGED_SORT_DIRECTION,
    sortDirection
  };
}

export function changeSortField(sortField: string): ChangedSortField {
  return {
    type: CHANGED_SORT_FIELD,
    sortField
  };
}

export function dispose(): Dispose {
  return { type: DISPOSE };
}

export function editCell(name: string): EditCell {
  return {
    type: EDIT_CELL,
    name
  };
}
export function editCellAbort(): EditCellAbort {
  return { type: EDIT_CELL_ABORT };
}
export function editCellSave(value: string): EditCellSave {
  return {
    type: EDIT_CELL_SAVE,
    value
  };
}

export function fileAdded(rawFile: RawFile): FileAdded {
  return {
    type: FILE_ADDED,
    rawFile
  };
}
export function fileChanged(rawFile: RawFile): FileChanged {
  return {
    type: FILE_CHANGED,
    rawFile
  };
}
export function fileDeleted(filename: string): FileDeleted {
  return {
    type: FILE_DELETED,
    filename
  };
}
export function fileRenamed(filenames: {
  filename: string,
  oldFilename: string
}): FileRenamed {
  return {
    type: FILE_RENAMED,
    ...filenames
  };
}
export function fileFound(): FileFound {
  return { type: FILE_FOUND };
}
export function fileRead(result: FileReadResult): FileRead {
  return {
    type: FILE_READ,
    ...result
  };
}
export function fileReadFailed(meta: FileReadFailedParams): FileReadFailed {
  const { filename, notePropName } = meta;
  return {
    type: FILE_READ_FAILED,
    filename,
    notePropName
  };
}

export function readDirDone(rawFiles: RawFile[]): ReadDirDone {
  return {
    type: READ_DIR_DONE,
    rawFiles
  };
}

export function openNote(): OpenNote {
  return { type: OPEN_NOTE };
}

export function readFilesDone(): ReadFilesDone {
  return { type: READ_FILES_DONE };
}

export function resetSearch(): ResetSearch {
  return { type: RESET_SEARCH };
}

export function resizeList(listHeight: number): ResizedList {
  return {
    type: RESIZED_LIST,
    listHeight
  };
}

export function scroll(scrollTop: number): Scrolled {
  return {
    type: SCROLLED,
    scrollTop
  };
}

export function search(query: string): Search {
  return {
    type: SEARCH,
    query
  };
}

export function selectNext(): SelectNext {
  return { type: SELECT_NEXT };
}
export function selectNote(filename: string): SelectNote {
  return {
    type: SELECT_NOTE,
    filename
  };
}
export function selectPrev(): SelectPrev {
  return { type: SELECT_PREV };
}
