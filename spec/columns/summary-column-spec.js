'use babel'

import NotesFile from '../../lib/notes-file'
import SummaryColumn from '../../lib/columns/summary-column'
import SearchMatch from '../../lib/search-match'

describe('columns/summary-column', function () {
  let column: ColumnType

  beforeEach(function () {
    column = new SummaryColumn({sortField: 'name'})
  })

  describe('.sortField', function () {
    it('should return given sort field value', function () {
      expect(column.sortField).toEqual('name')
    })
  })

  describe('.cellContent', function () {
    let file

    beforeEach(function () {
      file = new NotesFile('markdown.md', relPath => `/notes/${relPath}`, {
        content: '# testing markdown\nshould be **Zzz** by now tho'
      })
    })

    describe('when there is no query applied', function () {
      let cellContent

      beforeEach(function () {
        cellContent = column.cellContent(file)
      })

      it('should return a kind of AST from which a DOM can be created', function () {
        expect(cellContent).toEqual(jasmine.any(Array))
        expect(cellContent[0]).toEqual(jasmine.any(Object), 'title')
        expect(cellContent[0].attrs).toEqual({
          className: 'icon icon-file-text',
          'data-name': 'markdown.md',
          'data-path': '/notes/markdown.md'
        })
        expect(cellContent[0].content).toEqual(jasmine.any(Array))
        expect(cellContent[0].content).toEqual([
          'markdown',
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ])

        expect(cellContent[1]).toEqual(jasmine.any(String), 'should be a separator between title and file content preview')

        expect(cellContent[2]).toEqual(jasmine.any(Object), 'file content preview')
        expect(cellContent[2].attrs).toEqual(jasmine.any(Object))
        expect(cellContent[2].content).toEqual(jasmine.any(String))
      })
    })

    describe('when there is a search query', function () {
      let cellContent

      it('should provide what parts of title and file content preview that should be highlighted', function () {
        // Match in the middle
        cellContent = column.cellContent(file, new SearchMatch(/[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭][dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]/i)) // as generated by sifter.js
        expect(cellContent).toEqual(jasmine.any(Array))
        expect(cellContent[0]).toEqual(jasmine.any(Object), 'title')
        expect(cellContent[0].attrs).toEqual({
          className: 'icon icon-file-text',
          'data-name': 'markdown.md',
          'data-path': '/notes/markdown.md'
        })
        expect(cellContent[0].content).toEqual([
          ['mar', {attrs: {className: 'text-highlight'}, content: 'kd'}, 'own'],
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ])
        expect(cellContent[1]).toEqual(' - ')
        expect(cellContent[2].content).toEqual(
          ['# testing mar', {attrs: {className: 'text-highlight'}, content: 'kd'}, 'own\nshould be **Zzz** by now tho']
        )

        // Match at beginning of string
        cellContent = column.cellContent(file, new SearchMatch(/m[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]/i))
        expect(cellContent[0].content).toEqual([
          ['', {attrs: {className: 'text-highlight'}, content: 'ma'}, 'rkdown'],
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ])

        // Match at end of string
        cellContent = column.cellContent(file, new SearchMatch(/[wẂẃẀẁŴŵẄẅẆẇẈẉ][nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]/i))
        expect(cellContent[0].content).toEqual([
          ['markdo', {attrs: {className: 'text-highlight'}, content: 'wn'}, ''],
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ])

        // No match
        cellContent = column.cellContent(file, new SearchMatch(/Zzz/i))
        expect(cellContent[0].content).toEqual([
          'markdown',
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ], 'match of end should only contain rest+end')
        expect(cellContent[2].content).toEqual(
          ['…arkdown\nshould be **', {attrs: {className: 'text-highlight'}, content: 'Zzz'}, '** by now tho']
        )
      })
    })
  })
})
