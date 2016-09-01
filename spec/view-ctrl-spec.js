/* @flow */

import Bacon from 'baconjs'
import ReactView from '../lib/react-view'
import ViewCtrl from '../lib/view-ctrl'

describe('view-ctrl', function () {
  let buses, DOMNode, testPanel, testView, viewCtrl, spies
  let showSpy: Function

  beforeEach(function () {
    atom.config.set('textual-velocity.path', '~/test')
    atom.config.set('textual-velocity.listHeight', 123)
    atom.config.set('textual-velocity.rowHeight', 25)
    atom.config.set('textual-velocity.sortDirection', 'asc')
    atom.config.set('textual-velocity.sortField', 'content')

    buses = {
      clickedRow: new Bacon.Bus(),
      keyDown: new Bacon.Bus(),
      keyInput: new Bacon.Bus(),
      listHeight: new Bacon.Bus(),
      sortDirection: new Bacon.Bus(),
      sortField: new Bacon.Bus(),
      scrollTop: new Bacon.Bus()
    }

    DOMNode = document.createElement('div')
    showSpy = jasmine.createSpy('testPanel.show')
    testPanel = {
      getItem: () => DOMNode,
      show: showSpy
    }

    testView = new ReactView(testPanel)
    testView.clickedRowStream = buses.clickedRow
    testView.keyDownStream = buses.keyDown
    testView.listHeightStream = buses.listHeight
    testView.sortDirectionStream = buses.sortDirection
    testView.sortFieldStream = buses.sortField
    testView.scrollTopStream = buses.scrollTop
    testView.textInputStream = buses.keyInput

    viewCtrl = new ViewCtrl(testView)

    spies = {
      activePathStream: jasmine.createSpy('activePathStream'),
      clickedRowStream: jasmine.createSpy('clickedRowStream'),
      keyDownStream: jasmine.createSpy('keyDownStream'),
      keyEnterStream: jasmine.createSpy('keyEnterStream'),
      keyEscStream: jasmine.createSpy('keyEscStream'),
      keyUpStream: jasmine.createSpy('keyUpStream'),
      listHeightStream: jasmine.createSpy('listHeightStream'),
      rowHeightStream: jasmine.createSpy('rowHeightStream'),
      scrollTopStream: jasmine.createSpy('scrollTopStream'),
      sessionStartStream: jasmine.createSpy('sessionStartStream'),
      sortDirectionStream: jasmine.createSpy('sortDirectionStream'),
      sortFieldStream: jasmine.createSpy('sortFieldStream'),
      textInputStream: jasmine.createSpy('textInputStream')
    }
    viewCtrl.activePathStream.onValue(spies.activePathStream)
    viewCtrl.clickedRowStream.onValue(spies.clickedRowStream)
    viewCtrl.keyDownStream.onValue(spies.keyDownStream)
    viewCtrl.keyEnterStream.onValue(spies.keyEnterStream)
    viewCtrl.keyEscStream.onValue(spies.keyEscStream)
    viewCtrl.keyUpStream.onValue(spies.keyUpStream)
    viewCtrl.listHeightStream.onValue(spies.listHeightStream)
    viewCtrl.rowHeightStream.onValue(spies.rowHeightStream)
    viewCtrl.scrollTopStream.onValue(spies.scrollTopStream)
    viewCtrl.sessionStartStream.onValue(spies.sessionStartStream)
    viewCtrl.sortDirectionStream.onValue(spies.sortDirectionStream)
    viewCtrl.sortFieldStream.onValue(spies.sortFieldStream)
    viewCtrl.textInputStream.onValue(spies.textInputStream)
  })

  afterEach(function () {
    viewCtrl.deactivate()
  })

  describe('when activated', function () {
    beforeEach(function () {
      spyOn(atom.workspace, 'open')

      viewCtrl.activate()
    })

    it('should start session', function () {
      expect(spies.sessionStartStream).toHaveBeenCalled()

      const req = spies.sessionStartStream.mostRecentCall.args[0]
      expect(req.rootPath).toMatch(/.+test$/, 'should pass root path from config')
      expect(req.rootPath).not.toContain('~', 'should not allow home dir since it is most likely too big to handle for now')
      expect(req.ignoredNames).toEqual(atom.config.get('core.ignoredNames', 'should pass ignored filenames from config'))
      expect(req.excludeVcsIgnoredPaths).toEqual(atom.config.get('core.excludeVcsIgnoredPaths'), 'should pass excludeVcsIgnoredPaths filenames from config')
    })

    it('should have values for initial streams', function () {
      expect(spies.listHeightStream).toHaveBeenCalledWith(123)
      expect(spies.rowHeightStream).toHaveBeenCalledWith(25)
    })

    describe('when a row is clicked', function () {
      it('should yield a index on clickedRowStream', function () {
        buses.clickedRow.push(3)
        expect(spies.clickedRowStream).toHaveBeenCalledWith(3)
      })
    })

    describe('when there is key events', function () {
      let newKeyEvent

      beforeEach(function () {
        newKeyEvent = (keyCode) => ({
          keyCode: keyCode,
          preventDefault: jasmine.createSpy('preventDefault')
        })
      })

      it('should search on normal text input', function () {
        buses.keyInput.push('')
        expect(spies.textInputStream).toHaveBeenCalledWith('')
        buses.keyInput.push('a')
        expect(spies.textInputStream).toHaveBeenCalledWith('a')
        buses.keyInput.push('a test')
        expect(spies.textInputStream).toHaveBeenCalledWith('a test')

        expect(spies.keyEnterStream).not.toHaveBeenCalled()
        expect(spies.keyDownStream).not.toHaveBeenCalled()
        expect(spies.keyUpStream).not.toHaveBeenCalled()
      })

      it('should yield open event on enter', function () {
        const event = newKeyEvent(13) // enter
        buses.keyDown.push(event)
        expect(spies.keyEnterStream).toHaveBeenCalled()
        expect(event.preventDefault).toHaveBeenCalled()

        expect(spies.textInputStream).not.toHaveBeenCalled()
        expect(spies.keyDownStream).not.toHaveBeenCalled()
        expect(spies.keyUpStream).not.toHaveBeenCalled()
      })

      it('should yield selection by index on up/down events', function () {
        let event = newKeyEvent(38) // up
        buses.keyDown.push(event)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(spies.keyUpStream).toHaveBeenCalledWith(event)
        expect(spies.keyDownStream).not.toHaveBeenCalled()
        expect(spies.keyEnterStream).not.toHaveBeenCalled()
        expect(spies.textInputStream).not.toHaveBeenCalled()

        spies.keyDownStream.reset()
        spies.keyUpStream.reset()
        event = newKeyEvent(40) // down
        buses.keyDown.push(event)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(spies.keyUpStream).not.toHaveBeenCalled()
        expect(spies.keyDownStream).toHaveBeenCalledWith(event)
        expect(event.preventDefault).toHaveBeenCalled()

        expect(spies.keyEnterStream).not.toHaveBeenCalled()
        expect(spies.textInputStream).not.toHaveBeenCalled()

        spies.keyDownStream.reset()
        spies.keyUpStream.reset()
        event = newKeyEvent(30) // else?
        buses.keyDown.push(event)
        expect(spies.keyUpStream).not.toHaveBeenCalled()
        expect(spies.keyDownStream).not.toHaveBeenCalled()
        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(spies.keyEnterStream).not.toHaveBeenCalled()
        expect(spies.textInputStream).not.toHaveBeenCalled()
      })
    })

    describe('when sort changes', function () {
      beforeEach(function () {
        atom.config.set('textual-velocity.sortDirection', 'asc')
        atom.config.set('textual-velocity.sortfield', 'content')
      })

      it('should yield values on sort streams', function () {
        expect(spies.sortDirectionStream).toHaveBeenCalledWith('asc')
        expect(spies.sortFieldStream).toHaveBeenCalledWith('content')
      })
    })
  })
})
