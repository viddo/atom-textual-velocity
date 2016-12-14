/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import keyDownEpic, {ESC, DOWN, UP} from '../../lib/epics/key-down'
import * as actions from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(keyDownEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('key-down epic', () => {
  let store, event

  beforeEach(() => {
    store = mockStore()
    event = {
      keyCode: 0,
      preventDefault: jasmine.createSpy('preventDefault')
    }
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(keyDownEpic)
  })

  describe('when ESC key down action', function () {
    beforeEach(function () {
      event.keyCode = ESC
      store.dispatch(actions.keyDown(event))
    })

    it('should yield a reset search action', function () {
      const dispatchedActions = store.getActions()
      expect(dispatchedActions[1]).toEqual(actions.resetSearch())
    })
  })

  describe('when DOWN key down action', function () {
    beforeEach(function () {
      event.keyCode = DOWN
      store.dispatch(actions.keyDown(event))
    })

    it('should yield a reset search action', function () {
      const dispatchedActions = store.getActions()
      expect(dispatchedActions[1]).toEqual(actions.selectNextNote())
    })

    it('should prevent default behavior of event to not move cursor in text field', function () {
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('when UP key down action', function () {
    beforeEach(function () {
      event.keyCode = UP
      store.dispatch(actions.keyDown(event))
    })

    it('should yield a reset search action', function () {
      const dispatchedActions = store.getActions()
      expect(dispatchedActions[1]).toEqual(actions.selectPrevNote())
    })

    it('should prevent default behavior of event to not move cursor in text field', function () {
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('when random key down action', function () {
    beforeEach(function () {
      event.keyCode = 101
      store.dispatch(actions.keyDown(event))
    })

    it('should not yield any reset action', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== 'KEY_DOWN')
      expect(dispatchedActions).toEqual([])
    })
  })

  describe('when dispose action', function () {
    beforeEach(function () {
      store.dispatch(actions.dispose())
      event.keyCode = ESC
      store.dispatch(actions.keyDown(event))
    })

    it('should no longer create any actions', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== 'KEY_DOWN')
      expect(dispatchedActions).toEqual([actions.dispose()])
    })
  })
})
