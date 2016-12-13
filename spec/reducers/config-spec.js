/* @flow */

import {initialScanDone, resizeList, changeListHeight} from '../../lib/action-creators'
import setupConfigReducer from '../../lib/reducers/config'

describe('config reducer', () => {
  let state, configReducer

  beforeEach(function () {
    atom.config.set('textual-velocity.path', '/notes')
    atom.config.set('textual-velocity.sortField', 'name')
    configReducer = setupConfigReducer()
  })

  it('should return state unless defaults are missing', function () {
    state = configReducer(state, initialScanDone())
    expect(state).toEqual(jasmine.objectContaining({
      dir: '/notes',
      sortField: 'name'
    }))

    const prevState = state
    state = configReducer(state, initialScanDone())
    expect(state).toBe(prevState)
  })

  describe('when resized list', function () {
    beforeEach(function () {
      state = configReducer(state, resizeList(123))
    })

    it('should update list height', function () {
      expect(state.listHeight).toEqual(123)
    })
  })

  describe('when resized list', function () {
    beforeEach(function () {
      state = configReducer(state, resizeList(123))
    })

    it('should update list height', function () {
      expect(state.listHeight).toEqual(123)
    })
  })

  describe('when change list height', function () {
    beforeEach(function () {
      state = configReducer(state, changeListHeight(123))
    })

    it('should update list height', function () {
      expect(state.listHeight).toEqual(123)
    })
  })

  describe('when other random action', function () {
    let prevState

    beforeEach(function () {
      prevState = state
      state = configReducer(state, initialScanDone())
    })

    it('should update list height', function () {
      expect(prevState).toBe(state)
    })
  })
})
