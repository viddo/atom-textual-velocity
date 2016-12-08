/* @flow */

export function startInitialScan (): ActionType {
  return {type: 'START_INITIAL_SCAN'}
}

export function scannedFile (file: FileType): ActionType {
  return {
    type: 'SCANNED_FILE',
    file: file
  }
}

export function initialScanDone (): ActionType {
  return {type: 'INITIAL_SCAN_DONE'}
}

export function dispose (): ActionType {
  return {type: 'DISPOSE'}
}
