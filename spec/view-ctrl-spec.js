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
      clickedRowS: new Bacon.Bus(),
      keyDownS: new Bacon.Bus(),
      keyInputS: new Bacon.Bus(),
      listHeightS: new Bacon.Bus(),
      sortDirectionS: new Bacon.Bus(),
      sortFieldS: new Bacon.Bus(),
      scrollTopS: new Bacon.Bus()
    }

    DOMNode = document.createElement('div')
    showSpy = jasmine.createSpy('testPanel.show')
    testPanel = {
      getItem: () => DOMNode,
      show: showSpy
    }

    testView = new ReactView(testPanel)
    testView.clickedCellS = buses.clickedRowS
    testView.keyDownS = buses.keyDownS
    testView.listHeightS = buses.listHeightS
    testView.sortDirectionS = buses.sortDirectionS
    testView.sortFieldS = buses.sortFieldS
    testView.scrollTopS = buses.scrollTopS
    testView.textInputS = buses.keyInputS

    viewCtrl = new ViewCtrl(testView)

    spies = {
      activePathS: jasmine.createSpy('activePathS'),
      clickedCellS: jasmine.createSpy('clickedCellS'),
      keyDownS: jasmine.createSpy('keyDownS'),
      keyEnterS: jasmine.createSpy('keyEnterS'),
      keyEscS: jasmine.createSpy('keyEscS'),
      keyUpS: jasmine.createSpy('keyUpS'),
      listHeightS: jasmine.createSpy('listHeightS'),
      rowHeightS: jasmine.createSpy('rowHeightS'),
      scrollTopS: jasmine.createSpy('scrollTopS'),
      sessionStartS: jasmine.createSpy('sessionStartS'),
      sortDirectionS: jasmine.createSpy('sortDirectionS'),
      sortFieldS: jasmine.createSpy('sortFieldS'),
      textInputS: jasmine.createSpy('textInputS')
    }
    viewCtrl.activePathS.onValue(spies.activePathS)
    viewCtrl.clickedCellS.onValue(spies.clickedCellS)
    viewCtrl.keyDownS.onValue(spies.keyDownS)
    viewCtrl.keyEnterS.onValue(spies.keyEnterS)
    viewCtrl.keyEscS.onValue(spies.keyEscS)
    viewCtrl.keyUpS.onValue(spies.keyUpS)
    viewCtrl.listHeightS.onValue(spies.listHeightS)
    viewCtrl.rowHeightS.onValue(spies.rowHeightS)
    viewCtrl.scrollTopS.onValue(spies.scrollTopS)
    viewCtrl.sessionStartS.onValue(spies.sessionStartS)
    viewCtrl.sortDirectionS.onValue(spies.sortDirectionS)
    viewCtrl.sortFieldS.onValue(spies.sortFieldS)
    viewCtrl.textInputS.onValue(spies.textInputS)
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
      expect(spies.sessionStartS).toHaveBeenCalled()

      const req = spies.sessionStartS.mostRecentCall.args[0]
      expect(req.rootPath).toMatch(/.+test$/, 'should pass root path from config')
      expect(req.rootPath).not.toContain('~', 'should not allow home dir since it is most likely too big to handle for now')
      expect(req.ignoredNames).toEqual(atom.config.get('core.ignoredNames', 'should pass ignored filenames from config'))
      expect(req.excludeVcsIgnoredPaths).toEqual(atom.config.get('core.excludeVcsIgnoredPaths'), 'should pass excludeVcsIgnoredPaths filenames from config')
    })

    it('should have values for initial streams', function () {
      expect(spies.listHeightS).toHaveBeenCalledWith(123)
      expect(spies.rowHeightS).toHaveBeenCalledWith(25)
    })

    describe('when a row is clicked', function () {
      it('should yield a index on clickedCellS', function () {
        buses.clickedRowS.push(3)
        expect(spies.clickedCellS).toHaveBeenCalledWith(3)
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
        buses.keyInputS.push('')
        expect(spies.textInputS).toHaveBeenCalledWith('')
        buses.keyInputS.push('a')
        expect(spies.textInputS).toHaveBeenCalledWith('a')
        buses.keyInputS.push('a test')
        expect(spies.textInputS).toHaveBeenCalledWith('a test')

        expect(spies.keyEnterS).not.toHaveBeenCalled()
        expect(spies.keyDownS).not.toHaveBeenCalled()
        expect(spies.keyUpS).not.toHaveBeenCalled()
      })

      it('should yield open event on enter', function () {
        const event = newKeyEvent(13) // enter
        buses.keyDownS.push(event)
        expect(spies.keyEnterS).toHaveBeenCalled()
        expect(event.preventDefault).toHaveBeenCalled()

        expect(spies.textInputS).not.toHaveBeenCalled()
        expect(spies.keyDownS).not.toHaveBeenCalled()
        expect(spies.keyUpS).not.toHaveBeenCalled()
      })

      it('should yield selection by index on up/down events', function () {
        let event = newKeyEvent(38) // up
        buses.keyDownS.push(event)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(spies.keyUpS).toHaveBeenCalledWith(event)
        expect(spies.keyDownS).not.toHaveBeenCalled()
        expect(spies.keyEnterS).not.toHaveBeenCalled()
        expect(spies.textInputS).not.toHaveBeenCalled()

        spies.keyDownS.reset()
        spies.keyUpS.reset()
        event = newKeyEvent(40) // down
        buses.keyDownS.push(event)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(spies.keyUpS).not.toHaveBeenCalled()
        expect(spies.keyDownS).toHaveBeenCalledWith(event)
        expect(event.preventDefault).toHaveBeenCalled()

        expect(spies.keyEnterS).not.toHaveBeenCalled()
        expect(spies.textInputS).not.toHaveBeenCalled()

        spies.keyDownS.reset()
        spies.keyUpS.reset()
        event = newKeyEvent(30) // else?
        buses.keyDownS.push(event)
        expect(spies.keyUpS).not.toHaveBeenCalled()
        expect(spies.keyDownS).not.toHaveBeenCalled()
        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(spies.keyEnterS).not.toHaveBeenCalled()
        expect(spies.textInputS).not.toHaveBeenCalled()
      })
    })

    describe('when sort changes', function () {
      beforeEach(function () {
        atom.config.set('textual-velocity.sortDirectionS', 'asc')
        atom.config.set('textual-velocity.sortfield', 'content')
      })

      it('should yield values on sort streams', function () {
        expect(spies.sortDirectionS).toHaveBeenCalledWith('asc')
        expect(spies.sortFieldS).toHaveBeenCalledWith('content')
      })
    })
  })
})
