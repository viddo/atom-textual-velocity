/* @flow */

export function startInitialScan (): ActionType {
  return {type: 'START_INITIAL_SCAN'}
}

export function scannedFile (rawFile: RawFileType): ActionType {
  return {
    type: 'SCANNED_FILE',
    rawFile: rawFile
  }
}

export function initialScanDone (): ActionType {
  return {type: 'INITIAL_SCAN_DONE'}
}

export function dispose (): ActionType {
  return {type: 'DISPOSE'}
}
