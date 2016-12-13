/* @flow */

export function startInitialScan (): Action {
  return {type: 'START_INITIAL_SCAN'}
}

export function scannedFile (rawFile: RawFile): Action {
  return {
    type: 'SCANNED_FILE',
    rawFile
  }
}

export function initialScanDone (): Action {
  return {type: 'INITIAL_SCAN_DONE'}
}

export function search (query: string): Action {
  return {
    type: 'SEARCH',
    query
  }
}

export function scroll (scrollTop: number): Action {
  return {
    type: 'SCROLLED',
    scrollTop
  }
}

export function resizeList (listHeight: number): Action {
  return {
    type: 'RESIZED_LIST',
    listHeight
  }
}

export function changeListHeight (listHeight: number): Action {
  return {
    type: 'CHANGED_LIST_HEIGHT',
    listHeight
  }
}

export function changeRowHeight (rowHeight: number): Action {
  return {
    type: 'CHANGED_ROW_HEIGHT',
    rowHeight
  }
}

export function dispose (): Action {
  return {type: 'DISPOSE'}
}
