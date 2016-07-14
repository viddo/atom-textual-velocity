'use babel'

import Summary from '../../lib/columns/summary'

describe('columns/summary', function () {
  beforeEach(function () {
    this.summary = new Summary()
  })

  describe('.cellContent', function () {
    beforeEach(function () {
      this.content = this.summary.cellContent({
        path: '/notes/markdown.md',
        name: 'markdown',
        ext: '.md',
        content: '# header\na **body** of _text_'
      })
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

      expect(this.content[1]).toEqual(jasmine.any(String), 'should be a separator between title and file content preview')

      expect(this.content[2]).toEqual(jasmine.any(Object), 'file content preview')
      expect(this.content[2].attrs).toEqual(jasmine.any(Object))
      expect(this.content[2].content).toEqual(jasmine.any(String))
    })
  })
})
