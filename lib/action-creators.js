/* @flow */

export function startInitialScan (): Action {
  return {type: 'START_INITIAL_SCAN'}
}

export function scannedFile (rawFile: RawFile): Action {
  return {
    type: 'SCANNED_FILE',
    rawFile: rawFile
  }
}

export function initialScanDone (): Action {
  return {type: 'INITIAL_SCAN_DONE'}
}

export function scrolled (scrollTop: number): Action {
  return {
    type: 'SCROLLED',
    scrollTop: scrollTop
  }
}

export function dispose (): Action {
  return {type: 'DISPOSE'}
}
