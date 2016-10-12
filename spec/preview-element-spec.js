/* @flow */

import PreviewElement from '../lib/preview-element'

describe('preview-element', function () {
  let preview

  beforeEach(function () {
    preview = new PreviewElement()
  })

  afterEach(function () {
    preview.dispose()
  })

  it('should have a title compatible for tab panes', function () {
    expect(preview.getTitle()).toEqual(jasmine.any(String))
    expect(preview.getLongTitle()).toEqual(jasmine.any(String))
  })

  describe('when note is set', function () {
    beforeEach(function () {
      preview.setNote('/test/path.txt', 'foo\nbar\nbaz')
    })

    it('should update the preview content', function () {
      expect(preview.innerHTML).toContain('foo')
      expect(preview.innerHTML).toContain('bar<br>')
      expect(preview.innerHTML).toContain('baz')
    })

    it('should have a path', function () {
      expect(preview.getPath()).toEqual('/test/path.txt')
    })

    describe('when element is attached to DOM', function () {
      beforeEach(function () {
        spyOn(atom.workspace, 'open')
        jasmine.attachToDOM(preview)
      })

      describe('when clicked', function () {
        beforeEach(function () {
          preview.click()
        })

        it('should open current path', function () {
          expect(atom.workspace.open).toHaveBeenCalledWith('/test/path.txt')
        })

        describe('when cleared', function () {
          beforeEach(function () {
            preview.clear()
          })

          describe('when clicked', function () {
            beforeEach(function () {
              atom.workspace.open.reset()
              preview.click()
            })

            it('should not open anything', function () {
              expect(atom.workspace.open).not.toHaveBeenCalled()
            })
          })
        })

        describe('when detached from DOM', function () {
          beforeEach(function () {
            atom.workspace.open.reset()
            preview.remove()
          })

          it('should should no longer open anything when clicked', function () {
            expect(atom.workspace.open).not.toHaveBeenCalled()
          })
        })
      })
    })
  })
})
