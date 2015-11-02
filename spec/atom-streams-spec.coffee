atoms = require '../lib/atom-streams'

describe 'Atom streams', ->
  describe '.createConfigStream', ->
    describe 'when setting does not have any initial value', ->
      beforeEach ->
        @spy = jasmine.createSpy('onValue')
        atoms.createConfigStream('notational.test').onValue(@spy)

        waitsFor =>
          @spy.calls.length is 1

      it 'returns a stream with no initial event', ->
        expect(@spy).toHaveBeenCalled()
        expect(@spy.calls[0].args[0]).toBeUndefined()

      it 'returned stream gets new values when config is updated', ->
        atom.config.set('notational.test', 123)

        waitsFor =>
          @spy.calls.length is 2
        runs =>
          expect(@spy.calls[1].args[0]).toEqual(123)
          atom.config.set('notational.test', 456)

        waitsFor =>
          @spy.calls.length is 3
        runs =>
          expect(@spy.calls[2].args[0]).toEqual(456)

    describe 'when setting has an value already', ->
      beforeEach ->
        atom.config.set('notational.test', 123)
        @spy = jasmine.createSpy('onValue')
        atoms.createConfigStream('notational.test').onValue(@spy)

        waitsFor =>
          @spy.calls.length is 1

      it 'creates a stream with the initial value as 1st event', ->
        expect(@spy).toHaveBeenCalled()
        expect(@spy.calls[0].args[0]).toEqual(123)


  describe '.createCommandStream', ->
    beforeEach ->
      @workspaceView = atom.views.getView(atom.workspace)
      @workspaceView.className = '.test'
      jasmine.attachToDOM(@workspaceView)
      @spy = jasmine.createSpy('cmd')
      atoms.createCommandStream('atom-workspace', 'cat:cmd').onValue(@spy)

    it 'returns a stream that gets command events when command is matched', ->
      atom.commands.dispatch(@workspaceView, 'cat:whatever')
      atom.commands.dispatch(@workspaceView, 'cat:cmd') #match
      atom.commands.dispatch(@workspaceView, 'cat:other')
      atom.commands.dispatch(@workspaceView, 'cat:cmd') #match

      waitsFor =>
        @spy.calls.length is 2

      runs =>
        expect(@spy.calls[0].args[0]).not.toBeUndefined()
        expect(@spy.calls[1].args[0]).not.toBeUndefined()
        expect(@spy.calls.length).toEqual(2)


  describe '.projectPaths', ->
    beforeEach ->
      spyOn(atom.project, 'getPaths').andReturn(['/tmp/1st', '/tmp/2nd']) # Initial paths
      {openStream, closeStream} = atoms.createProjectsPathsStreams()
      @addSpy = jasmine.createSpy('openStream')
      @removeSpy = jasmine.createSpy('closeStream')
      openStream.onValue(@addSpy)
      closeStream.onValue(@removeSpy)

      waitsFor =>
        @addSpy.calls.length is 2

      runs ->
        # Simulate adding/removing some paths after initialized
        atom.project.emitter.emit('did-change-paths', ['/tmp/1st', '/tmp/2nd', '/tmp/3rd']) # add 3rd
        atom.project.emitter.emit('did-change-paths', ['/tmp/1st', '/tmp/3rd']) # remove 2nd
        atom.project.emitter.emit('did-change-paths', ['/tmp/3rd', '/tmp/4th', '/tmp/5th']) # remove 1st, add 4th and 5th

      waitsFor =>
        @addSpy.calls.length is 5

    it 'triggers an add event for each initial path', ->
      expect(@addSpy).toHaveBeenCalled()
      expect(@addSpy.calls[0].args[0]).toEqual('/tmp/1st')
      expect(@addSpy.calls[1].args[0]).toEqual('/tmp/2nd')

    it 'triggers an add event for each new path added after that', ->
      expect(@addSpy.calls[2].args[0]).toEqual('/tmp/3rd')
      expect(@addSpy.calls[3].args[0]).toEqual('/tmp/4th')
      expect(@addSpy.calls[4].args[0]).toEqual('/tmp/5th')

    it 'triggers a remove event for each path removed after that', ->
      expect(@removeSpy).toHaveBeenCalled()
      expect(@removeSpy.calls[0].args[0]).toEqual('/tmp/2nd')
      expect(@removeSpy.calls[1].args[0]).toEqual('/tmp/1st')
