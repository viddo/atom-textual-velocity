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

export function scrolled (scrollTop: number): Action {
  return {
    type: 'SCROLLED',
    scrollTop
  }
}

export function dispose (): Action {
  return {type: 'DISPOSE'}
}
