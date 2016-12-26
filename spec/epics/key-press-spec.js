/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import keyPressEpic, {ESC} from '../../lib/epics/key-press'
import * as actions from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(keyPressEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('epics/key-press', () => {
  let store, event

  beforeEach(() => {
    store = mockStore()
    event = {
      keyCode: 0,
      preventDefault: jasmine.createSpy('preventDefault')
    }
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(keyPressEpic)
  })

  describe('when ESC key down action', function () {
    beforeEach(function () {
      event.keyCode = ESC
      store.dispatch(actions.keyPress(event))
    })

    it('should yield a reset search action', function () {
      const dispatchedActions = store.getActions()
      expect(dispatchedActions[1]).toEqual(actions.resetSearch())
    })
  })

  describe('when random key down action', function () {
    beforeEach(function () {
      event.keyCode = 101
      store.dispatch(actions.keyPress(event))
    })

    it('should not yield any reset action', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== actions.KEY_PRESS)
      expect(dispatchedActions).toEqual([])
    })
  })

  describe('when dispose action', function () {
    beforeEach(function () {
      store.dispatch(actions.dispose())
      event.keyCode = ESC
      store.dispatch(actions.keyPress(event))
    })

    it('should no longer create any actions', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== actions.KEY_PRESS)
      expect(dispatchedActions).toEqual([actions.dispose()])
    })
  })
})
