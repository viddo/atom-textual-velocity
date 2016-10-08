'use babel'

import NotesCache from '../lib/notes-cache'

describe('notes-cache', () => {
  let notesCache, loadSpy

  beforeEach(function () {
    atom.enablePersistence = true
    atom.stateStore.clear()
    loadSpy = jasmine.createSpy('load')
    spyOn(atom.stateStore, 'save').andCallThrough()
    notesCache = new NotesCache()
  })

  afterEach(function () {
    notesCache.dispose()
    atom.stateStore.clear()
    atom.enablePersistence = false
  })

  it('should load an empty cache object if there is none', function () {
    notesCache.load(loadSpy)
    waitsFor(() => loadSpy.calls.length)
    runs(() => {
      expect(loadSpy).toHaveBeenCalledWith({})
    })
  })

  it('should load cache object if it was saved', function () {
    let notes
    notesCache.load(loadSpy)
    waitsFor(() => loadSpy.calls.length >= 1)
    runs(() => {
      notes = loadSpy.mostRecentCall.args[0]
      notes['some-file'] = {}
      notesCache.save()
    })
    waitsFor(() => atom.stateStore.save.calls.length >= 1)
    runs(() => {
      loadSpy.reset()
      notesCache.load(loadSpy)
    })
    waitsFor(() => loadSpy.calls.length >= 1)
    runs(() => {
      expect(loadSpy.mostRecentCall.args[0]).toEqual(notes)
    })
  })

  it('should discard current notes cache when clear-notes-cache is called', function () {
    let notes

    notesCache.load(loadSpy)
    waitsFor(() => loadSpy.calls.length >= 1)
    runs(() => {
      notes = loadSpy.mostRecentCall.args[0]
      notes['some-file'] = {}

      const workspaceView = atom.views.getView(atom.workspace)
      jasmine.attachToDOM(workspaceView)
      atom.commands.dispatch(workspaceView, 'textual-velocity:clear-notes-cache')

      notesCache.save()
    })
    waitsFor(() => atom.stateStore.save.calls.length >= 1)
    runs(() => {
      loadSpy.reset()
      notesCache.load(loadSpy)
    })
    waitsFor(() => loadSpy.calls.length >= 1)
    runs(() => {
      expect(loadSpy.mostRecentCall.args[0]).toEqual({})
      expect(loadSpy.mostRecentCall.args[0]).not.toEqual(notes)
    })
  })

  it('should discard current notes cache when notes path changes', function () {
    let notes

    notesCache.load(loadSpy)
    waitsFor(() => loadSpy.calls.length >= 1)
    runs(() => {
      notes = loadSpy.mostRecentCall.args[0]
      notes['some-file'] = {}

      atom.config.set('textual-velocity.path', 'new/path')

      notesCache.save()
    })
    waitsFor(() => atom.stateStore.save.calls.length >= 1)
    runs(() => {
      loadSpy.reset()
      notesCache.load(loadSpy)
    })
    waitsFor(() => loadSpy.calls.length >= 1)
    runs(() => {
      expect(loadSpy.mostRecentCall.args[0]).toEqual({})
      expect(loadSpy.mostRecentCall.args[0]).not.toEqual(notes)
    })
  })
})
