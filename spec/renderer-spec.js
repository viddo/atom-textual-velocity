'use babel'

import {TestUtils} from 'react-for-atom'
import * as reactRenderer from '../lib/react-renderer'
import Interactor from '../lib/interactor'

[
  {name: 'reactRenderer', renderer: reactRenderer}
].forEach(function ({name, renderer}) {
  describe(name, function () {
    beforeEach(function () {
      this.interactor = new Interactor({})
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
      describe('given an empty set', function () {
        beforeEach(function () {
          renderer.renderResults({
            DOMNode: this.DOMNode,
            interactor: this.interactor,
            listHeight: 123,
            rowHeight: 25,
            res: {
              focusSearchInput: true,
              forcedScrollTop: 0,
              itemsCount: 0,
              paginationStart: 0,
              columns: [],
              rows: []
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
            interactor: this.interactor,
            listHeight: 25,
            rowHeight: 20,
            res: {
              focusSearchInput: true,
              forcedScrollTop: 0,
              itemsCount: 3,
              paginationStart: 0,
              columns: [
                {title: 'Name', key: 'title', width: 70},
                {title: 'Updated', key: 'updated_date', width: 15},
                {title: 'Created', key: 'created_date', width: 15}
              ],
              rows: [
                {id: 2, title: 'foobar', created_date: '3 days ago', updated_date: 'yesterday'},
                {id: 3, title: 'baz', created_date: '3 days ago', updated_date: 'today'},
                {id: 1, title: 'qux', created_date: '1 year ago', updated_date: '1 year ago'}
              ]
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
            spyOn(this.interactor, 'search')
            const input = this.DOMNode.querySelector('input')
            input.value = 'foo'
            TestUtils.Simulate.change(input)
          })

          it('should search with the text', function () {
            expect(this.interactor.search).toHaveBeenCalledWith('foo')
          })
        })

        describe('when scrolling', function () {
          beforeEach(function () {
            spyOn(this.interactor, 'paginate')
            const scrollableList = this.DOMNode.querySelector('div[style*=overflow]')
            TestUtils.Simulate.scroll(scrollableList, {target: {scrollTop: 26}})
          })

          it('should paginate results', function () {
            expect(this.interactor.paginate).toHaveBeenCalledWith({
              start: 1, limit: 3
            })
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
