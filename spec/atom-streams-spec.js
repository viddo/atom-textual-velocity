'use babel'

import atoms from '../lib/atom-streams'

describe('Atom streams', () => {
  describe('.createConfigStream', () => {
    describe('when setting does not have any initial value', () => {
      beforeEach(() => {
        this.spy = jasmine.createSpy('onValue')
        atoms.createConfigStream('notational.test').onValue(this.spy)

        waitsFor(() => {
          return this.spy.calls.length === 1
        })
      })

      it('returns a stream with no initial event', () => {
        expect(this.spy).toHaveBeenCalled()
        expect(this.spy.calls[0].args[0]).toBeUndefined()
      })

      it('returned stream gets new values when config is updated', () => {
        atom.config.set('notational.test', 123)

        waitsFor(() => {
          return this.spy.calls.length === 2
        })
        runs(() => {
          expect(this.spy.calls[1].args[0]).toEqual(123)
          atom.config.set('notational.test', 456)
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
        atom.config.set('notational.test', 123)
        this.spy = jasmine.createSpy('onValue')
        atoms.createConfigStream('notational.test').onValue(this.spy)

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

  describe('.projectPaths', () => {
    beforeEach(() => {
      spyOn(atom.project, 'getPaths').andReturn(['/tmp/1st', '/tmp/2nd']) // Initial paths
      let {openStream, closeStream} = atoms.createProjectsPathsStreams()
      this.addSpy = jasmine.createSpy('openStream')
      this.removeSpy = jasmine.createSpy('closeStream')
      openStream.onValue(this.addSpy)
      closeStream.onValue(this.removeSpy)

      waitsFor(() => {
        return this.addSpy.calls.length === 2
      })

      runs(() => {
        // Simulate adding/removing some paths after initialized
        atom.project.emitter.emit('did-change-paths', ['/tmp/1st', '/tmp/2nd', '/tmp/3rd']) // add 3rd
        atom.project.emitter.emit('did-change-paths', ['/tmp/1st', '/tmp/3rd']) // remove 2nd
        atom.project.emitter.emit('did-change-paths', ['/tmp/3rd', '/tmp/4th', '/tmp/5th']) // remove 1st, add 4th and 5th
      })

      waitsFor(() => {
        return this.addSpy.calls.length === 5
      })
    })

    it('triggers an add event for each initial path', () => {
      expect(this.addSpy).toHaveBeenCalled()
      expect(this.addSpy.calls[0].args[0]).toEqual('/tmp/1st')
      expect(this.addSpy.calls[1].args[0]).toEqual('/tmp/2nd')
    })

    it('triggers an add event for each new path added after that', () => {
      expect(this.addSpy.calls[2].args[0]).toEqual('/tmp/3rd')
      expect(this.addSpy.calls[3].args[0]).toEqual('/tmp/4th')
      expect(this.addSpy.calls[4].args[0]).toEqual('/tmp/5th')
    })

    it('triggers a remove event for each path removed after that', () => {
      expect(this.removeSpy).toHaveBeenCalled()
      expect(this.removeSpy.calls[0].args[0]).toEqual('/tmp/2nd')
      expect(this.removeSpy.calls[1].args[0]).toEqual('/tmp/1st')
    })
  })
})
