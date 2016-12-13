/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import configEpic from '../../lib/epics/config'
import {resizeList} from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(configEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('config epic', () => {
  let store

  beforeEach(() => {
    atom.config.set('textual-velocity.listHeight', 0)
    store = mockStore()
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(configEpic)
  })

  it('should yield actions for initial values of config', function () {
    expect(store.getActions()).toEqual([
      {type: 'CHANGED_LIST_HEIGHT', listHeight: 0}
    ])
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
})
