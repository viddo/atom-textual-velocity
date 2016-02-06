'use babel'

import Bacon from 'baconjs'
import UI from '../lib/ui'
import { TestUtils } from 'react-for-atom'
import dispatchKeyDownEvent from './utils'

describe('UI', () => {
  let ui, input
  let spies, b

  beforeEach(function () {
    b = {
      panelHeightBus: new Bacon.Bus(),
      isLoadingBus: new Bacon.Bus(),
      filesBus: new Bacon.Bus(),
      resultsBus: new Bacon.Bus(),
      focusBus: new Bacon.Bus(),
      deselectBus: new Bacon.Bus()
    }

    ui = new UI({
      domNode: document.createElement('div'),
      panelHeightStream: b.panelHeightBus,
      isLoadingFilesProp: b.isLoadingBus.toProperty(false),
      filesProp: b.filesBus.toProperty([]),
      resultsProp: b.resultsBus.toProperty([]),
      focusOnSearchStream: b.focusBus,
      deselectStream: b.deselectBus
    })

    input = TestUtils.findRenderedDOMComponentWithTag(ui._reactPanel, 'input')

    spies = {
      searchProp: jasmine.createSpy('searchProp'),
      panelHeightProp: jasmine.createSpy('panelHeightProp'),
      selectedFileProp: jasmine.createSpy('selectedFileProp'),
      openFileStream: jasmine.createSpy('openFileStreamSpy'),
      createFileStream: jasmine.createSpy('createFileStreamSpy')
    }
    ui.searchProp.onValue(spies.searchProp)
    ui.panelHeightProp.onValue(spies.panelHeightProp)
    ui.selectedFileProp.onValue(spies.selectedFileProp)
    ui.openFileStream.onValue(spies.openFileStream)
    ui.createFileStream.onValue(spies.createFileStream)
  })

  describe('when there is some data', function () {
    beforeEach(function () {
      b.filesBus.push([{
        path: '/path/to/file.txt',
        content: '',
        stat: {}
      }])
      b.resultsBus.push({
        items: [{
          id: 0
        }]
      })
    })

    it('do not try to open or create a file on <enter>', function () {
      dispatchKeyDownEvent(input, { keyCode: 13 })
      expect(spies.createFileStream).not.toHaveBeenCalled()
      expect(spies.openFileStream).not.toHaveBeenCalled()

      // regression: make sure it's no triggering on subsequent char changes
      input.value = 'asd'
      TestUtils.Simulate.change(input)
      expect(spies.createFileStream).not.toHaveBeenCalled()
    })

    describe('when there is some input str', function () {
      describe('when the input str are just spaces', function () {
        beforeEach(function () {
          input.value = '  '
          TestUtils.Simulate.change(input)
        })

        it('createFileStream does not trigger on <enter>', function () {
          dispatchKeyDownEvent(input, { keyCode: 13 })
          expect(spies.createFileStream).not.toHaveBeenCalled()
        })
      })

      describe('when the input text is a token', function () {
        beforeEach(function () {
          input.value = 'foo'
          TestUtils.Simulate.change(input)
        })

        it('createFileStream triggers on <enter>', function () {
          dispatchKeyDownEvent(input, { keyCode: 13 })
          expect(spies.createFileStream).toHaveBeenCalled()
          expect(spies.createFileStream).toHaveBeenCalledWith('foo')
        })

        it('openFileStream does not trigger', function () {
          expect(spies.openFileStream).not.toHaveBeenCalled()
        })
      })
    })

    describe('when there is a selection', function () {
      beforeEach(function () {
        dispatchKeyDownEvent(input, { keyCode: 40 }) // <next>
      })

      it('selectedFileProp should trigger', function () {
        expect(spies.selectedFileProp).toHaveBeenCalled()
        expect(spies.selectedFileProp.calls[2].args[0]).toBeDefined()
      })

      it('openFileStream triggers on <enter> when there is a selected file', function () {
        dispatchKeyDownEvent(input, { keyCode: 13 })

        expect(spies.openFileStream).toHaveBeenCalled()
        expect(spies.openFileStream).toHaveBeenCalledWith('/path/to/file.txt')
      })

      it('createFileStream does not trigger ', function () {
        expect(spies.createFileStream).not.toHaveBeenCalled()
      })
    })
  })
})
