/* @flow */
import * as C from "./action-constants";

export function changedActivePaneItem(path: ?string): ChangedActivePaneItem {
  return {
    type: C.CHANGED_ACTIVE_PANE_ITEM,
    path
  };
}

export function changeHiddenColumns(
  hiddenColumns: string[]
): ChangedHiddenColumns {
  return {
    type: C.CHANGED_HIDDEN_COLUMNS,
    hiddenColumns
  };
}

export function changeListHeight(listHeight: number): ChangedListHeight {
  return {
    type: C.CHANGED_LIST_HEIGHT,
    listHeight
  };
}

export function changeRowHeight(rowHeight: number): ChangedRowHeight {
  return {
    type: C.CHANGED_ROW_HEIGHT,
    rowHeight
  };
}

export function changeSortDirection(
  sortDirection: SortDirection
): ChangedSortDirection {
  return {
    type: C.CHANGED_SORT_DIRECTION,
    sortDirection
  };
}

export function changeSortField(sortField: string): ChangedSortField {
  return {
    type: C.CHANGED_SORT_FIELD,
    sortField
  };
}

export function dispose(): Dispose {
  return { type: C.DISPOSE };
}

export function editCell(name: string): EditCell {
  return {
    type: C.EDIT_CELL,
    name
  };
}
export function editCellAbort(): EditCellAbort {
  return { type: C.EDIT_CELL_ABORT };
}
export function editCellSave(value: string): EditCellSave {
  return {
    type: C.EDIT_CELL_SAVE,
    value
  };
}

export function fileAdded(rawFile: RawFile): FileAdded {
  return {
    type: C.FILE_ADDED,
    rawFile
  };
}
export function fileChanged(rawFile: RawFile): FileChanged {
  return {
    type: C.FILE_CHANGED,
    rawFile
  };
}
export function fileDeleted(filename: string): FileDeleted {
  return {
    type: C.FILE_DELETED,
    filename
  };
}
export function fileRenamed(filenames: {
  filename: string,
  oldFilename: string
}): FileRenamed {
  return {
    type: C.FILE_RENAMED,
    ...filenames
  };
}
export function fileFound(): FileFound {
  return { type: C.FILE_FOUND };
}
export function fileRead(result: FileReadResult): FileRead {
  return {
    type: C.FILE_READ,
    ...result
  };
}
export function fileReadFailed(meta: FileReadFailedParams): FileReadFailed {
  const { filename, notePropName } = meta;
  return {
    type: C.FILE_READ_FAILED,
    filename,
    notePropName
  };
}

export function readDirDone(rawFiles: RawFile[]): ReadDirDone {
  return {
    type: C.READ_DIR_DONE,
    rawFiles
  };
}

export function openNote(): OpenNote {
  return { type: C.OPEN_NOTE };
}

export function readFilesDone(): ReadFilesDone {
  return { type: C.READ_FILES_DONE };
}

export function resetSearch(): ResetSearch {
  return { type: C.RESET_SEARCH };
}

export function resizeList(listHeight: number): ResizedList {
  return {
    type: C.RESIZED_LIST,
    listHeight
  };
}

export function scroll(scrollTop: number): Scrolled {
  return {
    type: C.SCROLLED,
    scrollTop
  };
}

export function search(query: string): Search {
  return {
    type: C.SEARCH,
    query
  };
}

export function selectNext(): SelectNext {
  return { type: C.SELECT_NEXT };
}
export function selectNote(filename: string): SelectNote {
  return {
    type: C.SELECT_NOTE,
    filename
  };
}
export function selectPrev(): SelectPrev {
  return { type: C.SELECT_PREV };
}
