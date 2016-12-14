/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import keyDownEpic, {ESC} from '../../lib/epics/key-down'
import * as actions from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(keyDownEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('key-down epic', () => {
  let store

  beforeEach(() => {
    store = mockStore()
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(keyDownEpic)
  })

  describe('when ESC key down action', function () {
    beforeEach(function () {
      store.dispatch(actions.keyDown({keyCode: ESC}))
    })

    it('should yield a reset search action', function () {
      const dispatchedActions = store.getActions()
      expect(dispatchedActions[1]).toEqual(actions.resetSearch())
    })
  })

  describe('when random key down action', function () {
    beforeEach(function () {
      store.dispatch(actions.keyDown({keyCode: 101})) // ?
    })

    it('should not yield any reset action', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== 'KEY_DOWN')
      expect(dispatchedActions).toEqual([])
    })
  })

  describe('when dispose action', function () {
    beforeEach(function () {
      store.dispatch(actions.dispose())
      store.dispatch(actions.keyDown({keyCode: ESC}))
    })

    it('should no longer create any actions', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== 'KEY_DOWN')
      expect(dispatchedActions).toEqual([actions.dispose()])
    })
  })
})
