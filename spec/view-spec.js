'use babel'

import {TestUtils} from 'react-for-atom'
import ReactView from '../lib/react-view'

[
  {
    name: 'reactView',
    newView: (DOMNode) => {
      const panel = {
        getItem: () => DOMNode
      }
      return new ReactView(panel)
    }
  }
].forEach(function ({name, newView}) {
  xdescribe(name, function () {
    let DOMNode: DOMNodeType
    let view: ViewType
    let spies: Object

    beforeEach(function () {
      DOMNode = document.createElement('div')
      view = newView(DOMNode)

      spies = {
        clickedCellStream: jasmine.createSpy('clickedCellStream'),
        keyDownStream: jasmine.createSpy('keyDownStream'),
        listHeightStream: jasmine.createSpy('listHeightStream'),
        sortDirectionStream: jasmine.createSpy('sortDirectionStream'),
        sortFieldStream: jasmine.createSpy('sortFieldStream'),
        scrollTopStream: jasmine.createSpy('scrollTopStream'),
        textInputStream: jasmine.createSpy('textInputStream')
      }

      view.clickedCellStream.onValue(spies.clickedCellStream)
      view.keyDownStream.onValue(spies.keyDownStream)
      view.listHeightStream.onValue(spies.listHeightStream)
      view.sortDirectionStream.onValue(spies.sortDirectionStream)
      view.sortFieldStream.onValue(spies.sortFieldStream)
      view.scrollTopStream.onValue(spies.scrollTopStream)
      view.textInputStream.onValue(spies.textInputStream)
    })

    afterEach(function () {
      view.dispose()
      view = null
      DOMNode = null
    })

    describe('.renderLoading', function () {
      beforeEach(function () {
        const listHeight = 101
        view.renderLoading(listHeight)
      })

      it('should render loading DOM', function () {
        expect(DOMNode.outerHTML).toContain('loading')
        expect(DOMNode.outerHTML).toContain('height: 101px')
      })
    })

    describe('.renderResults', function () {
      describe('given an empty set', function () {
        beforeEach(function () {
          view.renderResults({
            listHeight: 123,
            rowHeight: 25,
            scrollTop: 0,
            selectedIndex: undefined,
            searchStr: '',
            itemsCount: 0,
            paginationStart: 0,
            sort: {},
            columns: [],
            rows: []
          })
        })

        it('should render the panel DOM', function () {
          expect(DOMNode.innerHTML).not.toEqual('')
        })
      })

      describe('given some data', function () {
        let html

        beforeEach(function () {
          view.renderResults({
            DOMNode: DOMNode,
            listHeight: 25,
            rowHeight: 20,
            scrollTop: 0,
            selectedIndex: 1,
            searchStr: '',
            itemsCount: 3,
            paginationStart: 0,
            sort: {field: 'name', direction: 'desc'},
            columns: [
              {title: 'Name', id: 'title', width: 70},
              {title: 'Updated', id: 'last_updated_at', width: 15},
              {title: 'Created', id: 'created_date', width: 15}
            ],
            rows: [
              {id: 2, cells: ['foobar', '3 days ago', 'yesterday']},
              {id: 3, cells: ['baz', '3 days ago', 'today'], selected: true},
              {id: 1, cells: ['qux', '1 year ago', '1 year ago']}
            ],
            callbacks: {
              onSearch: spies.search,
              onKeyDown: spies.keyDown,
              onScroll: spies.scroll,
              onClickRow: spies.clickRow,
              onSortByField: spies.sortField,
              onChangeSortDirection: spies.sortDirection,
              onResize: spies.resize
            }
          })
          html = DOMNode.innerHTML
        })

        it('should render columns', function () {
          expect(html).toContain('Name')
          expect(html).toContain('Updated')
          expect(html).toContain('Created')
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
            expect(spies.textInputStream).toHaveBeenCalledWith('foo')
          })
        })

        describe('when scrolling', function () {
          beforeEach(function () {
            const scrollableList = DOMNode.querySelector('div[style*=overflow]')
            TestUtils.Simulate.scroll(scrollableList, {target: {scrollTop: 26}})
          })

          it('should call onScroll callback', function () {
            expect(spies.scrollTopStream).toHaveBeenCalledWith(26)
          })
        })
      })
    })
  })
})
