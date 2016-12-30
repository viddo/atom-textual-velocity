/* @flow */

export const CHANGED_LIST_HEIGHT = 'CHANGED_LIST_HEIGHT'
export function changeListHeight (listHeight: number): Action {
  return {
    type: CHANGED_LIST_HEIGHT,
    listHeight
  }
}

export const CHANGED_ROW_HEIGHT = 'CHANGED_ROW_HEIGHT'
export function changeRowHeight (rowHeight: number): Action {
  return {
    type: CHANGED_ROW_HEIGHT,
    rowHeight
  }
}

export const CHANGED_SORT_DIRECTION = 'CHANGED_SORT_DIRECTION'
export function changeSortDirection (sortDirection: SortDirection): Action {
  return {
    type: CHANGED_SORT_DIRECTION,
    sortDirection
  }
}

export const CHANGED_SORT_FIELD = 'CHANGED_SORT_FIELD'
export function changeSortField (sortField: string): Action {
  return {
    type: CHANGED_SORT_FIELD,
    sortField
  }
}

export const CLICK_ROW = 'CLICK_ROW'
export function clickRow (filename: string): Action {
  return {
    type: CLICK_ROW,
    filename
  }
}

export const DESELECT_NOTE = 'DESELECT_NOTE'
export function deselectNote (): Action {
  return {type: DESELECT_NOTE}
}

export const DISPOSE = 'DISPOSE'
export function dispose (): Action {
  return {type: DISPOSE}
}

export const FILE_ADDED = 'FILE_ADDED'
export function fileAdded (rawFile: RawFile): Action {
  return {
    type: FILE_ADDED,
    rawFile
  }
}

export const FILE_CHANGED = 'FILE_CHANGED'
export function fileChanged (rawFile: RawFile): Action {
  return {
    type: FILE_CHANGED,
    rawFile
  }
}

export const FILE_DELETED = 'FILE_DELETED'
export function fileDeleted (rawFile: RawFile): Action {
  return {
    type: FILE_DELETED,
    rawFile
  }
}

export const INITIAL_SCAN_DONE = 'INITIAL_SCAN_DONE'
export function initialScanDone (): Action {
  return {type: INITIAL_SCAN_DONE}
}

export const KEY_PRESS = 'KEY_PRESS'
export function keyPress (event: KeyPressEvent): Action {
  return {
    type: KEY_PRESS,
    event: event
  }
}

export const RESET_SEARCH = 'RESET_SEARCH'
export function resetSearch (): Action {
  return {type: RESET_SEARCH}
}

export const RESIZED_LIST = 'RESIZED_LIST'
export function resizeList (listHeight: number): Action {
  return {
    type: RESIZED_LIST,
    listHeight
  }
}

export const SCROLLED = 'SCROLLED'
export function scroll (scrollTop: number): Action {
  return {
    type: SCROLLED,
    scrollTop
  }
}

export const SEARCH = 'SEARCH'
export function search (query: string): Action {
  return {
    type: SEARCH,
    query
  }
}

export const SELECT_NOTE = 'SELECT_NOTE'
export function selectNote (selectedNote: SelectedNote): Action {
  return {
    type: SELECT_NOTE,
    selectedNote
  }
}

export const START_INITIAL_SCAN = 'START_INITIAL_SCAN'
export function startInitialScan (): Action {
  return {type: START_INITIAL_SCAN}
}
