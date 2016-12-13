/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import configEpic from '../../lib/epics/config'
import {resizeList, changeRowHeight} from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(configEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('config epic', () => {
  let store

  beforeEach(() => {
    atom.config.set('textual-velocity.listHeight', 0)
    atom.config.set('textual-velocity.rowHeight', 0)
    store = mockStore()
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(configEpic)
  })

  it('should yield actions for initial values of config', function () {
    const actions = store.getActions()
    expect(actions[0]).toEqual({type: 'CHANGED_LIST_HEIGHT', listHeight: 0})
    expect(actions[1]).toEqual({type: 'CHANGED_ROW_HEIGHT', rowHeight: 0})
  })

  describe('when resized list action', function () {
    let listHeightSpy

    beforeEach(function () {
      listHeightSpy = jasmine.createSpy('listHeight')
      atom.config.onDidChange('textual-velocity.listHeight', listHeightSpy)
      store.dispatch(resizeList(123))

      waitsFor(() => listHeightSpy.calls.length > 0)
    })

    it('should have updated list Height', function () {
      expect(atom.config.get('textual-velocity.listHeight')).toEqual(123)
    })

    it('should have yielded a last action', function () {
      const lastActions = store.getActions().slice(-2)
      expect(lastActions[0]).toEqual({type: 'RESIZED_LIST', listHeight: 123})
      expect(lastActions[1]).toEqual({type: 'CHANGED_LIST_HEIGHT', listHeight: 123})
    })
  })

  describe('when changed row height', function () {
    let rowHeightSpy

    beforeEach(function () {
      rowHeightSpy = jasmine.createSpy('rowHeight')
      atom.config.onDidChange('textual-velocity.rowHeight', rowHeightSpy)
      store.dispatch(changeRowHeight(26))

      waitsFor(() => rowHeightSpy.calls.length > 0)
    })

    it('should have updated list Height', function () {
      expect(atom.config.get('textual-velocity.rowHeight')).toEqual(26)
    })

    it('should have yielded a last action', function () {
      const lastActions = store.getActions().slice(-1)
      expect(lastActions[0]).toEqual({type: 'CHANGED_ROW_HEIGHT', rowHeight: 26})
    })
  })
})
