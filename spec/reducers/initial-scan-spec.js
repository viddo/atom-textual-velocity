/* @flow */

import {fileAdded, initialScanDone} from '../../lib/action-creators'
import initialScanReducer from '../../lib/reducers/initial-scan'

describe('reducers/initial-scan', () => {
  let state

  describe('when file-added action', function () {
    beforeEach(function () {
      state = initialScanReducer(state, fileAdded({
        filename: 'a',
        stats: {mtime: new Date()}
      }))
      state = initialScanReducer(state, fileAdded({
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

    it('should no longer add new files to raw files', function () {
      state = initialScanReducer(state, fileAdded({
        filename: 'b',
        stats: {mtime: new Date()}
      }))
      expect(state.rawFiles).toEqual([])
      expect(state.done).toBe(true)
    })
  })
})
