'use babel'

import Path from 'path'
import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import initalScanEpic from '../../lib/epics/initial-scan'

const epicMiddleware = createEpicMiddleware(initalScanEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('path-scan-task', () => {
  let store

  beforeEach(() => {
    const dir = Path.join(__dirname, '..', 'fixtures', 'standard')
    atom.config.set('textual-velocity.path', dir)
    atom.config.set('textual-velocity.ignoredNames', ['.DS_Store'])
    store = mockStore()
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(initalScanEpic)
  })

  it('should yield add events for each file found in dir', function () {
    expect(store.getActions()).toEqual([])
  })

  describe('when start-initial-scan action is triggered', function () {
    beforeEach(function () {
      store.dispatch({type: 'START_INITIAL_SCAN'})

      // wait for last expected action (so it's asserted implicitly, too)
      waitsFor(() => store.getActions().slice(-1)[0].type === 'INITIAL_SCAN_DONE')
    })

    it('should have yielded scanned-file actions for each file', function () {
      expect(store.getActions().length).toEqual(6)

      const [, firstFile] = store.getActions()
      expect(firstFile.type).toEqual('SCANNED_FILE')
      expect(firstFile.filename).toEqual('an-example.txt')
      expect(firstFile.stats).toEqual(jasmine.any(Object))
    })
  })

  describe('when dispose action is triggered before task has finished', function () {
    beforeEach(function () {
      store.dispatch({type: 'START_INITIAL_SCAN'})
      store.dispatch({type: 'DISPOSE'})
    })

    it('should terminate task', function () {
      expect(store.getActions().length).toEqual(2)
    })
  })
})
