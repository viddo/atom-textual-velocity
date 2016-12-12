/* @flow */

import {initialScanDone} from '../../lib/action-creators'
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
})
