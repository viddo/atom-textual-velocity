/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import configEpic from '../../lib/epics/config'
import * as actions from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(configEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('config epic', () => {
  let store

  beforeEach(() => {
    atom.config.set('textual-velocity.listHeight', 0)
    atom.config.set('textual-velocity.rowHeight', 0)
    atom.config.set('textual-velocity.sortDirection', 'desc')
    atom.config.set('textual-velocity.sortField', 'name')
    store = mockStore()
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(configEpic)
  })

  it('should yield actions for initial values of config', function () {
    const dispatchedActions = store.getActions()
    expect(dispatchedActions[0]).toEqual(actions.changeListHeight(0))
    expect(dispatchedActions[1]).toEqual(actions.changeRowHeight(0))
    expect(dispatchedActions[2]).toEqual(actions.changeSortDirection('desc'))
    expect(dispatchedActions[3]).toEqual(actions.changeSortField('name'))
  })

  describe('when resized list action', function () {
    let listHeightSpy

    beforeEach(function () {
      listHeightSpy = jasmine.createSpy('listHeight')
      atom.config.onDidChange('textual-velocity.listHeight', listHeightSpy)
      store.dispatch(actions.resizeList(123))

      waitsFor(() => listHeightSpy.calls.length > 0)
    })

    it('should have updated list Height', function () {
      expect(atom.config.get('textual-velocity.listHeight')).toEqual(123)
    })

    it('should have yielded a last action', function () {
      const lastActions = store.getActions().slice(-2)
      expect(lastActions[0]).toEqual(actions.resizeList(123))
      expect(lastActions[1]).toEqual(actions.changeListHeight(123))
    })
  })

  describe('when changed row height', function () {
    let rowHeightSpy

    beforeEach(function () {
      rowHeightSpy = jasmine.createSpy('rowHeight')
      atom.config.onDidChange('textual-velocity.rowHeight', rowHeightSpy)
      store.dispatch(actions.changeRowHeight(26))

      waitsFor(() => rowHeightSpy.calls.length > 0)
    })

    it('should have updated list Height', function () {
      expect(atom.config.get('textual-velocity.rowHeight')).toEqual(26)
    })

    it('should have yielded a last action', function () {
      const lastActions = store.getActions().slice(-1)
      expect(lastActions[0]).toEqual(actions.changeRowHeight(26))
    })
  })

  describe('when changed sort direction', function () {
    let sortDirectionSpy

    beforeEach(function () {
      sortDirectionSpy = jasmine.createSpy('sortDirection')
      atom.config.onDidChange('textual-velocity.sortDirection', sortDirectionSpy)
      store.dispatch(actions.changeSortDirection('asc'))

      waitsFor(() => sortDirectionSpy.calls.length > 0)
    })

    it('should have updated list Height', function () {
      expect(atom.config.get('textual-velocity.sortDirection')).toEqual('asc')
    })

    it('should have yielded a last action', function () {
      const lastActions = store.getActions().slice(-1)
      expect(lastActions[0]).toEqual(actions.changeSortDirection('asc'))
    })
  })

  describe('when changed sort field', function () {
    let sortFieldSpy

    beforeEach(function () {
      sortFieldSpy = jasmine.createSpy('sortField')
      atom.config.onDidChange('textual-velocity.sortField', sortFieldSpy)
      store.dispatch(actions.changeSortField('ext'))

      waitsFor(() => sortFieldSpy.calls.length > 0)
    })

    it('should have updated list Height', function () {
      expect(atom.config.get('textual-velocity.sortField')).toEqual('ext')
    })

    it('should have yielded a last action', function () {
      const lastActions = store.getActions().slice(-1)
      expect(lastActions[0]).toEqual(actions.changeSortField('ext'))
    })
  })
})
