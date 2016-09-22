'use babel'

import {TestUtils} from 'react-for-atom'
import ViewCtrl from '../lib/view-ctrl'

describe('view-ctrl', function () {
  let DOMNode, panel, viewCtrl, spies
  let showSpy: Function

  beforeEach(function () {
    atom.config.set('textual-velocity.path', '~/test')
    atom.config.set('textual-velocity.listHeight', 123)
    atom.config.set('textual-velocity.rowHeight', 25)
    atom.config.set('textual-velocity.sortDirection', 'asc')
    atom.config.set('textual-velocity.sortField', 'content')

    DOMNode = document.createElement('div')
    showSpy = jasmine.createSpy('panel.show')
    panel = {
      getItem: () => DOMNode,
      show: showSpy
    }

    viewCtrl = new ViewCtrl(panel)

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
    viewCtrl.dispose()
    DOMNode = null
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

    describe('when there is key events', function () {
      let newKeyEvent

      beforeEach(function () {
        newKeyEvent = (keyCode) => ({
          keyCode: keyCode,
          preventDefault: jasmine.createSpy('preventDefault')
        })
      })

      it('should search on normal text input', function () {
        viewCtrl._textInputBus.push('')
        expect(spies.textInputS).toHaveBeenCalledWith('')
        viewCtrl._textInputBus.push('a')
        expect(spies.textInputS).toHaveBeenCalledWith('a')
        viewCtrl._textInputBus.push('a test')
        expect(spies.textInputS).toHaveBeenCalledWith('a test')

        expect(spies.keyEnterS).not.toHaveBeenCalled()
        expect(spies.keyDownS).not.toHaveBeenCalled()
        expect(spies.keyUpS).not.toHaveBeenCalled()
      })

      it('should yield open event on enter', function () {
        const event = newKeyEvent(13) // enter
        viewCtrl._keyDownBus.push(event)
        expect(spies.keyEnterS).toHaveBeenCalled()
        expect(event.preventDefault).toHaveBeenCalled()

        expect(spies.textInputS).not.toHaveBeenCalled()
        expect(spies.keyDownS).not.toHaveBeenCalled()
        expect(spies.keyUpS).not.toHaveBeenCalled()
      })

      it('should yield selection by index on up/down events', function () {
        let event = newKeyEvent(38) // up
        viewCtrl._keyDownBus.push(event)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(spies.keyUpS).toHaveBeenCalledWith(event)
        expect(spies.keyDownS).not.toHaveBeenCalled()
        expect(spies.keyEnterS).not.toHaveBeenCalled()
        expect(spies.textInputS).not.toHaveBeenCalled()

        spies.keyDownS.reset()
        spies.keyUpS.reset()
        event = newKeyEvent(40) // down
        viewCtrl._keyDownBus.push(event)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(spies.keyUpS).not.toHaveBeenCalled()
        expect(spies.keyDownS).toHaveBeenCalledWith(event)
        expect(event.preventDefault).toHaveBeenCalled()

        expect(spies.keyEnterS).not.toHaveBeenCalled()
        expect(spies.textInputS).not.toHaveBeenCalled()

        spies.keyDownS.reset()
        spies.keyUpS.reset()
        event = newKeyEvent(30) // else?
        viewCtrl._keyDownBus.push(event)
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

    describe('.renderLoading', function () {
      beforeEach(function () {
        const listHeight = 101
        viewCtrl.renderLoading(listHeight)
      })

      it('should render loading DOM', function () {
        expect(DOMNode.outerHTML).toContain('loading')
        expect(DOMNode.outerHTML).toContain('height: 101px')
      })
    })

    describe('.renderResults', function () {
      describe('given an empty set', function () {
        beforeEach(function () {
          viewCtrl.renderResults({
            listHeight: 123,
            rowHeight: 25,
            scrollTop: 0,
            selectedIndex: undefined,
            searchStr: '',
            itemsCount: 0,
            paginationStart: 0,
            loadingProgress: {read: 0, total: 3},
            sort: {},
            columns: [],
            rows: []
          })
        })

        it('should render the panel DOM', function () {
          expect(DOMNode.innerHTML).not.toEqual('')
        })

        it('should not render loading progress', function () {
          expect(DOMNode.innerText).toContain('0 of 3 notes')
        })
      })

      describe('given some data', function () {
        let html

        beforeEach(function () {
          viewCtrl.renderResults({
            DOMNode: DOMNode,
            listHeight: 25,
            rowHeight: 20,
            scrollTop: 0,
            selectedIndex: 1,
            searchStr: '',
            itemsCount: 3,
            loadingProgress: {},
            paginationStart: 0,
            sort: {field: 'name', direction: 'desc'},
            columns: [
              {title: 'Name', id: 'title', width: 70},
              {title: 'Updated', id: 'last_updated_at', width: 15},
              {title: 'Created', id: 'created_date', width: 15}
            ],
            rows: [{
              id: 2,
              cells: [
                {content: 'foobar'},
                {content: '3 days ago'},
                {content: 'yesterday'}
              ]
            }, {
              id: 3,
              selected: true,
              cells: [
                {content: 'baz'},
                {content: '3 days ago'},
                {content: 'today'}
              ]
            }, {
              id: 1,
              cells: [
                {content: 'qux'},
                {content: '1 year ago'},
                {content: '1 year ago'}
              ]
            }]
          })
          html = DOMNode.innerHTML
        })

        it('should render columns', function () {
          expect(html).toContain('Name')
          expect(html).toContain('Updated')
          expect(html).toContain('Created')
        })

        it('should not render loading progress anymore', function () {
          expect(DOMNode.innerText).not.toContain('notes')
        })

        it('should render rows', function () {
          expect(html).toContain('foobar')
          expect(html).toContain('baz')
          expect(html).toContain('qux')

          expect(html).toContain('3 days ago')
          expect(html).toContain('today')
        })

        describe('when searching', function () {
          beforeEach(function () {
            const input = DOMNode.querySelector('input')
            input.value = 'foo'
            TestUtils.Simulate.change(input)
          })

          it('should call onSearch callback', function () {
            expect(spies.textInputS).toHaveBeenCalledWith('foo')
          })
        })

        describe('when scrolling', function () {
          beforeEach(function () {
            const scrollableList = DOMNode.querySelector('div[style*=overflow]')
            TestUtils.Simulate.scroll(scrollableList, {target: {scrollTop: 26}})
          })

          it('should call onScroll callback', function () {
            expect(spies.scrollTopS).toHaveBeenCalledWith(26)
          })
        })
      })
    })
  })
})
