'use babel'

import {TestUtils} from 'react-for-atom'
import * as reactRenderer from '../lib/react-renderer'

[
  {name: 'reactRenderer', renderer: reactRenderer}
].forEach(function ({name, renderer}) {
  describe(name, function () {
    beforeEach(function () {
      this.DOMNode = document.createElement('div')
    })

    afterEach(function () {
      this.DOMNode = null
    })

    describe('.renderLoading', function () {
      beforeEach(function () {
        renderer.renderLoading({DOMNode: this.DOMNode, listHeight: 100})
      })

      it('should render loading DOM', function () {
        expect(this.DOMNode.outerHTML).toContain('loading')
        expect(this.DOMNode.outerHTML).toContain('height: 100px')
      })
    })

    describe('.renderResults', function () {
      beforeEach(function () {
        this.searchSpy = jasmine.createSpy('onSearch')
        this.keyDownSpy = jasmine.createSpy('onKeyDown')
        this.scrollSpy = jasmine.createSpy('onScroll')
        this.clickRowSpy = jasmine.createSpy('onClickRow')
        this.sortByFieldSpy = jasmine.createSpy('onSortByField')
        this.sortDirectionSpy = jasmine.createSpy('onChangeSortDirectionSpy')
        this.resizeSpy = jasmine.createSpy('onResize')
      })

      describe('given an empty set', function () {
        beforeEach(function () {
          renderer.renderResults({
            DOMNode: this.DOMNode,
            listHeight: 123,
            rowHeight: 25,
            scrollTop: 0,
            res: {
              selectedIndex: undefined,
              searchStr: '',
              itemsCount: 0,
              paginationStart: 0,
              sort: {},
              columns: [],
              rows: []
            },
            callbacks: {
              onSearch: this.searchSpy,
              onKeyDown: this.keyDownSpy,
              onScroll: this.scrollSpy,
              onClickRow: this.clickRowSpy,
              onSortByField: this.sortByFieldSpy,
              onChangeSortDirection: this.sortDirectionSpy,
              onResize: this.resizeSpy
            }
          })
        })

        it('should render the panel DOM', function () {
          expect(this.DOMNode.innerHTML).not.toEqual('')
        })
      })

      describe('given some data', function () {
        beforeEach(function () {
          renderer.renderResults({
            DOMNode: this.DOMNode,
            listHeight: 25,
            rowHeight: 20,
            scrollTop: 0,
            res: {
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
              ]
            },
            callbacks: {
              onSearch: this.searchSpy,
              onKeyDown: this.keyDownSpy,
              onScroll: this.scrollSpy,
              onClickRow: this.clickRowSpy,
              onSortByField: this.sortByFieldSpy,
              onChangeSortDirection: this.sortDirectionSpy,
              onResize: this.resizeSpy
            }
          })
          this.html = this.DOMNode.innerHTML
        })

        it('should render columns', function () {
          expect(this.html).toContain('Name')
          expect(this.html).toContain('Updated')
          expect(this.html).toContain('Created')
        })

        it('should render rows', function () {
          expect(this.html).toContain('foobar')
          expect(this.html).toContain('baz')
          expect(this.html).toContain('qux')

          expect(this.html).toContain('3 days ago')
          expect(this.html).toContain('today')
        })

        describe('when searching', function () {
          beforeEach(function () {
            const input = this.DOMNode.querySelector('input')
            input.value = 'foo'
            TestUtils.Simulate.change(input)
          })

          it('should call onSearch callback', function () {
            expect(this.searchSpy).toHaveBeenCalledWith('foo')
          })
        })

        describe('when scrolling', function () {
          beforeEach(function () {
            const scrollableList = this.DOMNode.querySelector('div[style*=overflow]')
            TestUtils.Simulate.scroll(scrollableList, {target: {scrollTop: 26}})
            TestUtils.Simulate.scroll(scrollableList, {target: {scrollTop: 26}})
          })

          it('should call onScroll callback', function () {
            expect(this.scrollSpy).toHaveBeenCalledWith(26)
          })
        })
      })
    })

    describe('.remove', function () {
      it('should clean up DOMNode node', function () {
        this.DOMNode.innerHTML = '<div>asd</div>'
        renderer.remove(this.DOMNode)
        expect(this.DOMNode.innerHTML).toEqual('')
      })
    })
  })
})
