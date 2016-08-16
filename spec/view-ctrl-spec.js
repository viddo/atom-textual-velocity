'use babel'

import ReactView from '../lib/react-view'
import Interactor from '../lib/interactor'
import ViewCtrl from '../lib/view-ctrl'

describe('view-ctrl', function () {
  beforeEach(function () {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    atom.config.set('textual-velocity.path', '~/test')
    atom.config.set('textual-velocity.listHeight', 123)
    atom.config.set('textual-velocity.rowHeight', 25)

    const pathWatcherFactory = {}
    const presenter = {}

    this.interactor = new Interactor(presenter, pathWatcherFactory)
    spyOn(this.interactor, 'startSession')
    spyOn(this.interactor, 'search')
    spyOn(this.interactor, 'paginate')
    spyOn(this.interactor, 'selectPrev')
    spyOn(this.interactor, 'selectNext')
    spyOn(this.interactor, 'selectByIndex')
    spyOn(this.interactor, 'sortByField')
    spyOn(this.interactor, 'sortDirection')
    spyOn(this.interactor, 'stopSession')

    const DOMNode = this.DOMNode = document.createElement('div')
    this.atomPanel = {
      getItem: () => DOMNode,
      show: jasmine.createSpy('atomPanel.show')
    }

    this.view = new ReactView(this.atomPanel)
    spyOn(this.view, 'renderLoading').andCallThrough()
    spyOn(this.view, 'renderResults').andCallThrough()
    spyOn(this.view, 'dispose').andCallThrough()

    this.viewCtrl = new ViewCtrl(this.atomPanel, this.view)
    this.viewCtrl.interactor = this.interactor
  })

  afterEach(function () {
    this.viewCtrl.deactivate()
    this.viewCtrl.interactor = null

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

      it('should pass root path with value from config', function () {
        expect(this.req.rootPath).toMatch(/.+test$/)
        expect(this.req.rootPath).not.toContain('~')
      })

      it('should pass ignored filenames from config', function () {
        expect(this.req.ignoredNames).toEqual(atom.config.get('core.ignoredNames'))
      })

      it('should pass excludeVcsIgnoredPaths filenames from config', function () {
        expect(this.req.excludeVcsIgnoredPaths).toEqual(atom.config.get('core.excludeVcsIgnoredPaths'))
      })
    })

    // Should be called after startSession so tested in this scope to have same prerequisite state
    describe('.displayLoading', function () {
      beforeEach(function () {
        atom.config.set('textual-velocity.listHeight', 101)
        this.viewCtrl.displayLoading()
      })

      it('should render loading', function () {
        expect(this.view.renderLoading).toHaveBeenCalledWith(101)
        expect(this.atomPanel.show).toHaveBeenCalled()
      })

      // Should be called after displayLoading so tested in this scope to have same prerequisite state
      describe('.displaySearchResults', function () {
        beforeEach(function () {
          this.viewCtrl.displaySearchResults({
            selectedPath: '/notes/file0.txt',
            selectedIndex: 0,
            searchStr: '',
            paginationStart: 0,
            itemsCount: 3,
            sort: {field: 'name', direction: 'desc'},
            columns: [
              {title: 'Name', id: 'title', width: 70},
              {title: 'Updated', id: 'last_updated_at', width: 15},
              {title: 'Created', id: 'created_date', width: 15}
            ],
            rows: [
              {id: 2, cells: ['foobar', '3 days ago', 'yesterday'], selected: true},
              {id: 3, cells: ['baz', '3 days ago', 'today']},
              {id: 1, cells: ['qux', '1 year ago', '1 year ago']}
            ]
          })
        })

        it('should render results', function () {
          expect(this.view.renderResults).toHaveBeenCalled()
          var args = this.view.renderResults.calls[0].args[0]
          expect(args.listHeight).toEqual(jasmine.any(Number))
          expect(args.rowHeight).toEqual(jasmine.any(Number))
          expect(args.res).toEqual(jasmine.any(Object))

          expect(args.callbacks).toEqual({
            onSearch: jasmine.any(Function),
            onKeyDown: jasmine.any(Function),
            onScroll: jasmine.any(Function),
            onClickRow: jasmine.any(Function),
            onSortByField: jasmine.any(Function),
            onChangeSortDirection: jasmine.any(Function),
            onResize: jasmine.any(Function)
          })
        })

        describe('when search', function () {
          it('should search and reset scroll position', function () {
            this.interactor.search.reset()
            this.view.renderResults.calls[0].args[0].callbacks.onSearch('')
            expect(this.interactor.search).toHaveBeenCalledWith('')

            this.interactor.search.reset()
            this.view.renderResults.calls[0].args[0].callbacks.onSearch('foo')
            expect(this.interactor.search).toHaveBeenCalledWith('foo')
          })
        })

        describe('when scroll or list size changes', function () {
          it('should calculate pagination', function () {
            this.view.renderResults.calls[0].args[0].callbacks.onScroll(0)
            this.view.renderResults.calls[0].args[0].callbacks.onScroll(100)
            expect(this.interactor.paginate).toHaveBeenCalledWith({start: 4, limit: 6})

            this.interactor.paginate.reset()
            this.view.renderResults.calls[0].args[0].callbacks.onScroll(50)
            expect(this.interactor.paginate).toHaveBeenCalledWith({start: 2, limit: 6})

            this.interactor.paginate.reset()
            this.view.renderResults.calls[0].args[0].callbacks.onResize(150)
            expect(this.interactor.paginate).toHaveBeenCalledWith({start: 2, limit: 8})
          })
        })

        describe('when key is pressed', function () {
          it('should update state according to key pressed', function () {
            this.view.renderResults.calls[0].args[0].callbacks.onKeyDown({keyCode: 27}) // <esc>
            expect(this.interactor.search).toHaveBeenCalledWith('')

            const preventDefaultSpy = jasmine.createSpy('preventDefault')
            this.view.renderResults.calls[0].args[0].callbacks.onKeyDown({
              keyCode: 38, // <up>
              preventDefault: preventDefaultSpy
            })
            expect(this.interactor.selectPrev).toHaveBeenCalled()
            expect(preventDefaultSpy).toHaveBeenCalled()

            preventDefaultSpy.reset()
            this.view.renderResults.calls[0].args[0].callbacks.onKeyDown({
              keyCode: 40, // <down>
              preventDefault: preventDefaultSpy
            })
            expect(this.interactor.selectNext).toHaveBeenCalled()
            expect(preventDefaultSpy).toHaveBeenCalled()
          })
        })

        describe('when clicking an item', function () {
          it('should select item by index', function () {
            this.view.renderResults.calls[0].args[0].callbacks.onClickRow(1)
            expect(this.interactor.selectByIndex).toHaveBeenCalledWith(1)

            this.interactor.selectByIndex.reset()
            this.view.renderResults.calls[0].args[0].callbacks.onClickRow(3)
            expect(this.interactor.selectByIndex).toHaveBeenCalledWith(3)
          })
        })

        describe('when sort by a field', function () {
          beforeEach(function () {
            this.view.renderResults.calls[0].args[0].callbacks.onSortByField('tags')
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
            this.view.renderResults.calls[0].args[0].callbacks.onChangeSortDirection('asc')
          })

          it('should change sort direction', function () {
            expect(this.interactor.sortDirection).toHaveBeenCalledWith('asc')
          })

          it('should persist new direction', function () {
            expect(atom.config.get('textual-velocity.sortDirection')).toEqual('asc')
          })
        })

        describe('when window is resized', function () {
          beforeEach(function () {
            jasmine.Clock.useMock()
            spyOn(atom.config, 'set').andCallThrough()
            document.body.appendChild(this.DOMNode)
            window.dispatchEvent(new Event('resize'))
          })

          afterEach(function () {
            document.body.removeChild(this.DOMNode)
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
})
