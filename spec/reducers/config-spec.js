/* @flow */

import {initialScanDone, resizeList, changeListHeight, changeRowHeight, changeSortDirection, changeSortField} from '../../lib/action-creators'
import setupConfigReducer from '../../lib/reducers/config'

describe('config reducer', () => {
  let state, configReducer, expectedState

  beforeEach(function () {
    expectedState = {
      dir: '/notes',
      listHeight: 100,
      rowHeight: 25,
      sortDirection: 'desc',
      sortField: 'name'
    }
    atom.config.set('textual-velocity.path', expectedState.dir)
    atom.config.set('textual-velocity.listHeight', expectedState.listHeight)
    atom.config.set('textual-velocity.rowHeight', expectedState.rowHeight)
    atom.config.set('textual-velocity.sortDirection', expectedState.sortDirection)
    atom.config.set('textual-velocity.sortField', expectedState.sortField)
    configReducer = setupConfigReducer()

    state = configReducer(undefined, initialScanDone())
  })

  it('should return state unless defaults are missing', function () {
    const prevState = state
    state = configReducer(state, initialScanDone())
    expect(state).toBe(prevState)
  })

  describe('when resized list', function () {
    beforeEach(function () {
      state = configReducer(state, resizeList(123))
    })

    it('should only update list height', function () {
      expect(state.listHeight).toEqual(123)
      delete state.listHeight
      delete expectedState.listHeight
      expect(state).toEqual(expectedState)
    })
  })

  describe('when changed list height', function () {
    beforeEach(function () {
      state = configReducer(state, changeListHeight(123))
    })

    it('should only update list height', function () {
      expect(state.listHeight).toEqual(123)
      delete state.listHeight
      delete expectedState.listHeight
      expect(state).toEqual(expectedState)
    })
  })

  describe('when change row height', function () {
    beforeEach(function () {
      state = configReducer(state, changeRowHeight(20))
    })

    it('should only update row height', function () {
      expect(state.rowHeight).toEqual(20)
      delete state.rowHeight
      delete expectedState.rowHeight
      expect(state).toEqual(expectedState)
    })
  })

  describe('when only update sort direction', function () {
    beforeEach(function () {
      state = configReducer(state, changeSortDirection('asc'))
    })

    it('should update sort direction', function () {
      expect(state.sortDirection).toEqual('asc')
      delete state.sortDirection
      delete expectedState.sortDirection
      expect(state).toEqual(expectedState)
    })
  })

  describe('when change sort field', function () {
    beforeEach(function () {
      state = configReducer(state, changeSortField('ext'))
    })

    it('should only update sort direction', function () {
      expect(state.sortField).toEqual('ext')
      delete state.sortField
      delete expectedState.sortField
      expect(state).toEqual(expectedState)
    })
  })

  describe('when other random action', function () {
    it('should update list height', function () {
      const prevState = state
      state = configReducer(state, initialScanDone())
      expect(state).toBe(prevState)
    })
  })
})
