'use babel'

import Summary from '../../lib/columns/summary'

describe('columns/summary', function () {
  beforeEach(function () {
    this.summary = new Summary()
  })

  describe('.cellContent', function () {
    beforeEach(function () {
      this.mdFile = {
        path: '/notes/markdown.md',
        name: 'markdown',
        ext: '.md',
        content: '# testing markdown\nshould be **Zzz** by now tho'
      }
    })

    describe('when there is no query applied', function () {
      beforeEach(function () {
        this.content = this.summary.cellContent(this.mdFile, {})
      })

      it('should return a kind of AST from which a DOM can be created', function () {
        expect(this.content).toEqual(jasmine.any(Array))
        expect(this.content[0]).toEqual(jasmine.any(Object), 'title')
        expect(this.content[0].attrs).toEqual({
          className: 'icon icon-file-text',
          'data-name': 'markdown.md',
          'data-path': '/notes/markdown.md'
        })
        expect(this.content[0].content).toEqual(jasmine.any(Array))
        expect(this.content[0].content).toEqual([
          'markdown',
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ])

        expect(this.content[1]).toEqual(jasmine.any(String), 'should be a separator between title and file content preview')

        expect(this.content[2]).toEqual(jasmine.any(Object), 'file content preview')
        expect(this.content[2].attrs).toEqual(jasmine.any(Object))
        expect(this.content[2].content).toEqual(jasmine.any(String))
      })
    })

    describe('when there is a search query', function () {
      it('should provide what parts of title and file content preview that should be highlighted', function () {
        // Match in the middle
        this.content = this.summary.cellContent(this.mdFile, {
          sifterResult: {
            tokens: [{string: 'kd', regex: /[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭][dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]/i}] // generated from `(new (require('sifter'))([])).search('kd', {fields: []})`
          }
        })
        expect(this.content).toEqual(jasmine.any(Array))
        expect(this.content[0]).toEqual(jasmine.any(Object), 'title')
        expect(this.content[0].attrs).toEqual({
          className: 'icon icon-file-text',
          'data-name': 'markdown.md',
          'data-path': '/notes/markdown.md'
        })
        expect(this.content[0].content).toEqual([
          ['mar', {attrs: {className: 'text-highlight'}, content: 'kd'}, 'own'],
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ])
        expect(this.content[2].content).toEqual(
          ['# testing mar', {attrs: {className: 'text-highlight'}, content: 'kd'}, 'own\nshould be **Zzz** by now tho']
        )

        // Match at beginning of string
        this.content = this.summary.cellContent(this.mdFile, {
          sifterResult: {
            tokens: [ { string: 'ma', regex: /m[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]/i } ]
          }
        })
        expect(this.content[0].content).toEqual([
          ['', {attrs: {className: 'text-highlight'}, content: 'ma'}, 'rkdown'],
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ])

        // Match at end of string
        this.content = this.summary.cellContent(this.mdFile, {
          sifterResult: {
            tokens: [ { string: 'wn', regex: /[wẂẃẀẁŴŵẄẅẆẇẈẉ][nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]/i } ]
          }
        })
        expect(this.content[0].content).toEqual([
          ['markdo', {attrs: {className: 'text-highlight'}, content: 'wn'}, ''],
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ])

        // No match
        this.content = this.summary.cellContent(this.mdFile, {
          sifterResult: {
            tokens: [ { string: 'Zzz', regex: /Zzz/i } ]
          }
        })
        expect(this.content[0].content).toEqual([
          'markdown',
          {attrs: {className: 'text-subtle'}, content: '.md'}
        ], 'match of end should only contain rest+end')
        expect(this.content[2].content).toEqual(
          ['…arkdown\nshould be **', {attrs: {className: 'text-highlight'}, content: 'Zzz'}, '** by now tho']
        )
      })
    })
  })
})
