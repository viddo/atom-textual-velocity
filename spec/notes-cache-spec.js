'use babel'

import {it, fit} from './_async-spec-helpers' // eslint-disable-line
import NotesCache from '../lib/notes-cache'

describe('notes-cache', () => {
  let notesCache

  beforeEach(function () {
    atom.enablePersistence = true
    atom.stateStore.clear()
    notesCache = new NotesCache()
  })

  afterEach(function () {
    atom.enablePersistence = false
    notesCache.dispose()
    atom.stateStore.clear()
  })

  it('should load cache object if it was saved', async function () {
    const notes = await notesCache.load()
    expect(notes).toEqual({})
    notes['some-file'] = {}

    try {
      await notesCache.save()
    } catch (err) {
      this.fail('save should work')
    }
    const notes2 = await notesCache.load()
    expect(notes2).toEqual(notes)
  })

  it('should discard current notes cache when clear-notes-cache is called', async function () {
    const notes = await notesCache.load()
    notes['some-file'] = {}

    const workspaceView = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceView)
    atom.commands.dispatch(workspaceView, 'textual-velocity:clear-notes-cache')

    try {
      await notesCache.save()
    } catch (err) {
      this.fail('save should work')
    }
    const notes2 = await notesCache.load()
    expect(notes2).not.toEqual(notes)
    expect(notes2).toEqual({})
  })

  it('should discard current notes cache when notes path changes', async function () {
    const notes = await notesCache.load()
    notes['some-file'] = {}

    atom.config.set('textual-velocity.path', 'new/path')

    try {
      await notesCache.save()
    } catch (err) {
      this.fail('save should work')
    }
    const notes2 = await notesCache.load()
    expect(notes2).not.toEqual(notes)
    expect(notes2).toEqual({})
  })
})
