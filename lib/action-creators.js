/* @flow */

export const CHANGED_FILE = 'CHANGED_FILE'
export const NEW_FILE = 'NEW_FILE'
export const REMOVED_FILE = 'REMOVED_FILE'

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

export const DISPOSE = 'DISPOSE'
export function dispose (): Action {
  return {type: DISPOSE}
}

export const INITIAL_SCAN_DONE = 'INITIAL_SCAN_DONE'
export function initialScanDone (): Action {
  return {type: INITIAL_SCAN_DONE}
}

export const KEY_DOWN = 'KEY_DOWN'
export function keyDown (event: KeyDownEvent): Action {
  return {
    type: KEY_DOWN,
    event: event
  }
}

export const RESIZED_LIST = 'RESIZED_LIST'
export function resizeList (listHeight: number): Action {
  return {
    type: RESIZED_LIST,
    listHeight
  }
}

export const SCANNED_FILE = 'SCANNED_FILE'
export function scannedFile (rawFile: RawFile): Action {
  return {
    type: SCANNED_FILE,
    rawFile
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

export const START_INITIAL_SCAN = 'START_INITIAL_SCAN'
export function startInitialScan (): Action {
  return {type: START_INITIAL_SCAN}
}

export const RESET_SEARCH = 'RESET_SEARCH'
export function resetSearch (): Action {
  return {type: RESET_SEARCH}
}

export const SELECT_NEXT_NOTE = 'SELECT_NEXT_NOTE'
export function selectNextNote (): Action {
  return {type: SELECT_NEXT_NOTE}
}

export const SELECT_PREV_NOTE = 'SELECT_PREV_NOTE'
export function selectPrevNote (): Action {
  return {type: SELECT_PREV_NOTE}
}
