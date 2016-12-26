/* @flow */

import * as actions from '../../lib/action-creators'
import selectedNoteReducer from '../../lib/reducers/selected-note'

describe('reducers/selected-note', () => {
  let prevState
  let state

  beforeEach(function () {
    state = undefined
  })

  describe('when select note', function () {
    let selectedNote

    beforeEach(function () {
      prevState = {
        index: 1,
        filename: ''
      }
      selectedNote = {
        index: 2,
        filename: 'foo.txt'
      }
      state = selectedNoteReducer(prevState, actions.selectNote(selectedNote))
    })

    it('should update selection', function () {
      expect(state).toEqual(selectedNote)
    })
  })

  describe('when deselect note', function () {
    beforeEach(function () {
      prevState = {
        index: 1,
        filename: ''
      }
      state = selectedNoteReducer(prevState, actions.deselectNote())
    })

    it('should reset selection', function () {
      expect(state).toBe(null)
    })
  })

  describe('when called with other action', function () {
    beforeEach(function () {
      prevState = {
        index: 0,
        filename: 'alice.txt'
      }
      state = selectedNoteReducer(prevState, actions.initialScanDone())
    })

    it('should return state', function () {
      expect(state).toBe(prevState)
    })

    it('should set default if no previous state', function () {
      state = selectedNoteReducer(undefined, actions.initialScanDone())
      expect(state).toBe(null)
    })
  })
})
