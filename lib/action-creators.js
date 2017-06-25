/* @flow */

export const CHANGED_ACTIVE_PANE_ITEM = "CHANGED_ACTIVE_PANE_ITEM";
export function changedActivePaneItem(path: ?string): ChangedActivePaneItem {
  return {
    type: CHANGED_ACTIVE_PANE_ITEM,
    path
  };
}

export const CHANGED_HIDDEN_COLUMNS = "CHANGED_HIDDEN_COLUMNS";
export function changeHiddenColumns(
  hiddenColumns: string[]
): ChangedHiddenColumns {
  return {
    type: CHANGED_HIDDEN_COLUMNS,
    hiddenColumns
  };
}

export const CHANGED_LIST_HEIGHT = "CHANGED_LIST_HEIGHT";
export function changeListHeight(listHeight: number): ChangedListHeight {
  return {
    type: CHANGED_LIST_HEIGHT,
    listHeight
  };
}

export const CHANGED_ROW_HEIGHT = "CHANGED_ROW_HEIGHT";
export function changeRowHeight(rowHeight: number): ChangedRowHeight {
  return {
    type: CHANGED_ROW_HEIGHT,
    rowHeight
  };
}

export const CHANGED_SORT_DIRECTION = "CHANGED_SORT_DIRECTION";
export function changeSortDirection(
  sortDirection: SortDirection
): ChangedSortDirection {
  return {
    type: CHANGED_SORT_DIRECTION,
    sortDirection
  };
}

export const CHANGED_SORT_FIELD = "CHANGED_SORT_FIELD";
export function changeSortField(sortField: string): ChangedSortField {
  return {
    type: CHANGED_SORT_FIELD,
    sortField
  };
}

export const CLICK_ROW = "CLICK_ROW";
export function clickRow(filename: string): ClickRow {
  return {
    type: CLICK_ROW,
    filename
  };
}

export const DISPOSE = "DISPOSE";
export function dispose(): Dispose {
  return { type: DISPOSE };
}

export const EDIT_CELL = "EDIT_CELL";
export const EDIT_CELL_ABORT = "EDIT_CELL_ABORT";
export const EDIT_CELL_SAVE = "EDIT_CELL_SAVE";
export function editCell(name: string): EditCell {
  return {
    type: EDIT_CELL,
    name
  };
}
export function editCellAbort(): EditCellAbort {
  return { type: EDIT_CELL_ABORT };
}
export function editCellSave(
  editCellName: string,
  value: string
): EditCellSave {
  return {
    type: EDIT_CELL_SAVE,
    editCellName,
    value
  };
}

export const FILE_ADDED = "FILE_ADDED";
export const FILE_CHANGED = "FILE_CHANGED";
export const FILE_DELETED = "FILE_DELETED";
export const FILE_READ = "FILE_READ";
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
export function fileRead(result: FileReadResult): FileRead {
  return {
    type: FILE_READ,
    ...result
  };
}

export const INITIAL_SCAN_DONE = "INITIAL_SCAN_DONE";
export function initialScanDone(): InitialScanDone {
  return { type: INITIAL_SCAN_DONE };
}

export const INITIAL_SCAN_RAW_FILES_READ = "INITIAL_SCAN_RAW_FILES_READ";
export function initialScanRawFilesRead(): InitialScanRawFilesRead {
  return { type: INITIAL_SCAN_RAW_FILES_READ };
}

export const DOWN = 40;
export const ENTER = 13;
export const ESC = 27;
export const UP = 38;
export function keyPress(event: KeyPressEvent): Function {
  return (dispatch: Function) => {
    switch (event.keyCode) {
      case ENTER:
        dispatch(openNote());
        break;
      case ESC:
        dispatch(resetSearch());
        break;
      case DOWN:
        event.preventDefault();
        dispatch(selectNext());
        break;
      case UP:
        event.preventDefault();
        dispatch(selectPrev());
        break;
    }
  };
}

export const OPEN_NOTE = "OPEN_NOTE";
export function openNote(): OpenNote {
  return { type: OPEN_NOTE };
}

export const RESET_SEARCH = "RESET_SEARCH";
export function resetSearch(): ResetSearch {
  return { type: RESET_SEARCH };
}

export const RESIZED_LIST = "RESIZED_LIST";
export function resizeList(listHeight: number): ResizedList {
  return {
    type: RESIZED_LIST,
    listHeight
  };
}

export const SCROLLED = "SCROLLED";
export function scroll(scrollTop: number): Scrolled {
  return {
    type: SCROLLED,
    scrollTop
  };
}

export const SEARCH = "SEARCH";
export function search(query: string): Search {
  return {
    type: SEARCH,
    query
  };
}

export const SELECT_NEXT = "SELECT_NEXT";
export function selectNext(): SelectNext {
  return { type: SELECT_NEXT };
}
export const SELECT_PREV = "SELECT_PREV";
export function selectPrev(): SelectPrev {
  return { type: SELECT_PREV };
}

export const START_INITIAL_SCAN = "START_INITIAL_SCAN";
export function startInitialScan(): StartInitialScan {
  return { type: START_INITIAL_SCAN };
}
