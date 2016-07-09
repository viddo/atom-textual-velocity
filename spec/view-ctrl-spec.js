'use babel'

import * as reactRenderer from '../lib/react-renderer'
import Interactor from '../lib/interactor'
import ViewCtrl from '../lib/view-ctrl'

describe('view-ctrl', function () {
  beforeEach(function () {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    atom.config.set('textual-velocity.path', '~/test')
    atom.config.set('textual-velocity.listHeight', 123)
    atom.config.set('textual-velocity.rowHeight', 25)

    const presenter = {}

    this.interactor = new Interactor(presenter)
    spyOn(this.interactor, 'startSession')
    spyOn(this.interactor, 'search')
    spyOn(this.interactor, 'sortByField')
    spyOn(this.interactor, 'changeSortDirection')
    spyOn(this.interactor, 'stopSession')

    spyOn(reactRenderer, 'renderLoading').andCallThrough()
    spyOn(reactRenderer, 'renderResults').andCallThrough()
    spyOn(reactRenderer, 'remove').andCallThrough()

    this.viewCtrl = new ViewCtrl(reactRenderer)
    this.viewCtrl.setInteractor(this.interactor)
  })

  afterEach(function () {
    this.viewCtrl.deactivate()

    expect(this.viewCtrl.interactor).toBeFalsy()
    expect(this.interactor.stopSession).toHaveBeenCalled()
  })

  describe('.activate', function () {
    beforeEach(function () {
      this.viewCtrl.activate()
    })

    describe('should start session', function () {
      beforeEach(function () {
        expect(this.interactor.startSession).toHaveBeenCalled()
        this.req = this.interactor.startSession.calls[0].args[0]
      })

      it('should start session with current platform', function () {
        expect(this.req.platform).toEqual(jasmine.any(String))
      })

      it('should pass root path with value from config', function () {
        expect(this.req.rootPath).toEqual(atom.config.get('textual-velocity.path'))
      })

      it('should pass ignored filenames from config', function () {
        expect(this.req.ignoredNames).toEqual(atom.config.get('core.ignoredNames'))
      })

      it('should pass excludeVcsIgnoredPaths filenames from config', function () {
        expect(this.req.excludeVcsIgnoredPaths).toEqual(atom.config.get('core.excludeVcsIgnoredPaths'))
      })
    })
  })

  describe('.displayLoading', function () {
    beforeEach(function () {
      spyOn(atom.workspace, 'addTopPanel').andCallThrough()

      this.viewCtrl.displayLoading()
    })

    it('should create an atom panel', function () {
      expect(atom.workspace.addTopPanel).toHaveBeenCalled()
      expect(atom.workspace.addTopPanel.calls[0].args[0].item).toEqual(jasmine.any(HTMLElement))
    })

    it('should render loading', function () {
      expect(reactRenderer.renderLoading).toHaveBeenCalled()
    })

    // Should  be called after displayLoading so tested in this scope to have same prerequisite state
    describe('.displayResults', function () {
      beforeEach(function () {
        this.viewCtrl.displayResults({
          focusSearchInput: false,
          forcedScrollTop: 0,
          itemsCount: 3,
          paginationStart: 0,
          sort: {field: 'name', direction: 'desc'},
          columns: [
            {title: 'Name', key: 'title', width: 70, renderCell: row => row.title},
            {title: 'Updated', key: 'last_updated_at', width: 15},
            {title: 'Created', key: 'created_date', width: 15}
          ],
          rows: [
            {id: 2, title: 'foobar', created_date: '3 days ago', last_updated_at: 'yesterday'},
            {id: 3, title: 'baz', created_date: '3 days ago', last_updated_at: 'today'},
            {id: 1, title: 'qux', created_date: '1 year ago', last_updated_at: '1 year ago'}
          ]
        })
      })

      it('should render results', function () {
        expect(reactRenderer.renderResults).toHaveBeenCalled()
        var args = reactRenderer.renderResults.calls[0].args[0]
        expect(args.DOMNode).toEqual(jasmine.any(HTMLElement))
        expect(args.listHeight).toEqual(jasmine.any(Number))
        expect(args.rowHeight).toEqual(jasmine.any(Number))
        expect(args.res).toEqual(jasmine.any(Object))

        expect(args.callbacks).toEqual(jasmine.any(Object))
        expect(args.callbacks.onSearch).toEqual(jasmine.any(Function))
        expect(args.callbacks.onScroll).toEqual(jasmine.any(Function))
        expect(args.callbacks.onResize).toEqual(jasmine.any(Function))
        expect(args.callbacks.onSortByField).toEqual(jasmine.any(Function))
        expect(args.callbacks.onChangeSortDirection).toEqual(jasmine.any(Function))
      })

      describe('when search or scroll', function () {
        it('should search and reset scroll position', function () {
          this.interactor.search.reset()
          reactRenderer.renderResults.calls[0].args[0].callbacks.onScroll(100)
          expect(this.interactor.search).toHaveBeenCalledWith({str: '', start: 4, limit: 6}) // reset str, calc start+limit

          this.interactor.search.reset()
          reactRenderer.renderResults.calls[0].args[0].callbacks.onSearch('foo')
          expect(this.interactor.search).toHaveBeenCalledWith({str: 'foo', start: 0, limit: 6}) // set str, reset start, calc limit

          this.interactor.search.reset()
          reactRenderer.renderResults.calls[0].args[0].callbacks.onScroll(50)
          expect(this.interactor.search).toHaveBeenCalledWith({str: 'foo', start: 2, limit: 6}) // calc start, keep prev str+limit

          this.interactor.search.reset()
          reactRenderer.renderResults.calls[0].args[0].callbacks.onResize(150)
          expect(this.interactor.search).toHaveBeenCalledWith({str: 'foo', start: 2, limit: 8}) // calc limit, keep prev str+start
        })
      })

      describe('when sort by a field', function () {
        beforeEach(function () {
          reactRenderer.renderResults.calls[0].args[0].callbacks.onSortByField('tags')
        })

        it('should change field to sort by', function () {
          expect(this.interactor.sortByField).toHaveBeenCalledWith('tags')
        })

        it('should persist new field', function () {
          expect(atom.config.get('textual-velocity.sortField')).toEqual('tags')
        })
      })

      describe('when change sort direction', function () {
        beforeEach(function () {
          reactRenderer.renderResults.calls[0].args[0].callbacks.onChangeSortDirection('asc')
        })

        it('should change sort direction', function () {
          expect(this.interactor.changeSortDirection).toHaveBeenCalledWith()
        })

        it('should persist new direction', function () {
          expect(atom.config.get('textual-velocity.sortDirection')).toEqual('asc')
        })
      })

      describe('when window is resized', function () {
        beforeEach(function () {
          jasmine.Clock.useMock()
          spyOn(atom.config, 'set').andCallThrough()
          this.DOMNode = atom.workspace.getTopPanels()[0].item
          document.body.appendChild(this.DOMNode)
          window.dispatchEvent(new Event('resize'))
        })

        afterEach(function () {
          document.body.removeChild(this.DOMNode)
          this.DOMNode = null
        })

        it('should update row height', function () {
          expect(atom.config.set).not.toHaveBeenCalled()
          jasmine.Clock.tick(1000)
          expect(atom.config.set).toHaveBeenCalledWith('textual-velocity.rowHeight', jasmine.any(Number))
          expect(atom.config.get('textual-velocity.rowHeight') !== 25).toBe(true)
          expect(atom.config.get('textual-velocity.rowHeight') > 0).toBe(true)
        })
      })
    })
  })
})
