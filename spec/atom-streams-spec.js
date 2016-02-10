'use babel'

import * as atoms from '../lib/atom-streams'

describe('Atom streams', () => {
  describe('.createStream', function () {
    it('should be exported', function () {
      expect(atoms.createStream).toBeDefined()
    })
  })

  describe('.createConfigStream', () => {
    describe('when setting does not have any initial value', () => {
      beforeEach(() => {
        this.spy = jasmine.createSpy('onValue')
        atoms.createConfigStream('textual-velocity.test').onValue(this.spy)

        waitsFor(() => {
          return this.spy.calls.length === 1
        })
      })

      it('returns a stream with no initial event', () => {
        expect(this.spy).toHaveBeenCalled()
        expect(this.spy.calls[0].args[0]).toBeUndefined()
      })

      it('returned stream gets new values when config is updated', () => {
        atom.config.set('textual-velocity.test', 123)

        waitsFor(() => {
          return this.spy.calls.length === 2
        })
        runs(() => {
          expect(this.spy.calls[1].args[0]).toEqual(123)
          atom.config.set('textual-velocity.test', 456)
        })

        waitsFor(() => {
          return this.spy.calls.length === 3
        })
        runs(() => {
          expect(this.spy.calls[2].args[0]).toEqual(456)
        })
      })
    })

    describe('when setting has an value already', () => {
      beforeEach(() => {
        atom.config.set('textual-velocity.test', 123)
        this.spy = jasmine.createSpy('onValue')
        atoms.createConfigStream('textual-velocity.test').onValue(this.spy)

        waitsFor(() => {
          return this.spy.calls.length === 1
        })
      })

      it('creates a stream with the initial value as 1st event', () => {
        expect(this.spy).toHaveBeenCalled()
        expect(this.spy.calls[0].args[0]).toEqual(123)
      })
    })
  })

  describe('.createCommandStream', () => {
    beforeEach(() => {
      this.workspaceView = atom.views.getView(atom.workspace)
      this.workspaceView.className = '.test'
      jasmine.attachToDOM(this.workspaceView)
      this.spy = jasmine.createSpy('cmd')
      atoms.createCommandStream('atom-workspace', 'cat:cmd').onValue(this.spy)
    })

    it('returns a stream that gets command events when command is matched', () => {
      atom.commands.dispatch(this.workspaceView, 'cat:whatever')
      atom.commands.dispatch(this.workspaceView, 'cat:cmd') // match
      atom.commands.dispatch(this.workspaceView, 'cat:other')
      atom.commands.dispatch(this.workspaceView, 'cat:cmd') // match

      waitsFor(() => {
        return this.spy.calls.length === 2
      })

      runs(() => {
        expect(this.spy.calls[0].args[0]).not.toBeUndefined()
        expect(this.spy.calls[1].args[0]).not.toBeUndefined()
        expect(this.spy.calls.length).toEqual(2)
      })
    })
  })
})
