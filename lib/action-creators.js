/* @flow */

export const SCANNED_FILE = 'scanned file'
export const START_INITIAL_SCAN = 'start initial scan'
export const INITIAL_SCAN_DONE = 'initial scan done'
export const DISPOSE = 'dispose'

export function startInitialScan () {
  return {type: START_INITIAL_SCAN}
}

export function scannedFile (file: FileType) {
  return {
    type: SCANNED_FILE,
    file: file
  }
}

export function initialScanDone () {
  return {type: INITIAL_SCAN_DONE}
}

export function dispose () {
  return {type: DISPOSE}
}
