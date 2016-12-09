/* @flow */

import {scannedFile, initialScanDone} from '../../lib/action-creators'
import initialScanReducer from '../../lib/reducers/initial-scan'

describe('initial-scan reducer', () => {
  let state

  describe('when scanned-file action', function () {
    beforeEach(function () {
      state = initialScanReducer(state, scannedFile({
        filename: 'a',
        stats: {mtime: new Date()}
      }))
      state = initialScanReducer(state, scannedFile({
        filename: 'b',
        stats: {mtime: new Date()}
      }))
    })

    it('should append new files', function () {
      expect(state.rawFiles.length).toEqual(2)
      expect(state.rawFiles[0].filename).toEqual('a')
    })

    it('should not be done yet', function () {
      expect(state.done).toBe(false)
    })
  })

  describe('when initial-scan-done action', function () {
    beforeEach(function () {
      state = initialScanReducer(state, initialScanDone())
    })

    it('should set done flag to true', function () {
      expect(state.done).toBe(true)
    })
  })
})
