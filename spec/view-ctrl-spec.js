'use babel'

import Interactor from '../lib/interactor'
import ViewCtrl from '../lib/view-ctrl'
import fixToEqualJasmineAny from './fix-to-equal-jasmine-any'

fixToEqualJasmineAny()

describe('view-ctrl', function () {
  beforeEach(function () {
    const presenter = {}

    this.interactor = new Interactor(presenter)
    spyOn(this.interactor, 'startSession')
    spyOn(this.interactor, 'stopSession')

    this.viewCtrl = new ViewCtrl('view-ctrl test')
    this.viewCtrl.setInteractor(this.interactor)
  })

  afterEach(function () {
    this.viewCtrl.deactivate()

    expect(this.viewCtrl.interactor).toBeFalsy()
    expect(this.interactor.stopSession).toHaveBeenCalled()
  })

  describe('.activate', function () {
    beforeEach(function () {
      atom.config.set('textual-velocity.path', '~/test')
      atom.config.set('textual-velocity.panelHeight', 123)
      this.viewCtrl.activate()
    })

    it('should start session', function () {
      expect(this.interactor.startSession).toHaveBeenCalled()
      expect(this.interactor.startSession.calls[0].args[0]).toEqual(jasmine.any(Object))
    })

    it('should start session with current platform', function () {
      expect(this.interactor.startSession.calls[0].args[0].platform).toEqual(jasmine.any(String))
    })

    it('should pass root path with value from config', function () {
      expect(this.interactor.startSession.calls[0].args[0].rootPath).toEqual(atom.config.get('textual-velocity.path'))
    })

    it('should pass ignored filenames from config', function () {
      expect(this.interactor.startSession.calls[0].args[0].ignoredNames).toEqual(atom.config.get('core.ignoredNames'))
    })

    it('should pass excludeVcsIgnoredPaths filenames from config', function () {
      expect(this.interactor.startSession.calls[0].args[0].excludeVcsIgnoredPaths).toEqual(atom.config.get('core.excludeVcsIgnoredPaths'))
    })
  })

  describe('.displayLoading', function () {
    beforeEach(function () {
      spyOn(atom.workspace, 'addTopPanel').andCallThrough()

      this.viewCtrl.displayLoading({
        height: 123,
        process: [
          {desc: 'finished', done: true},
          {desc: 'in progress', current: true},
          {desc: 'pending'}
        ]
      })
    })

    it('should create an atom panel', function () {
      expect(atom.workspace.addTopPanel).toHaveBeenCalled()
      expect(atom.workspace.addTopPanel.calls[0].args[0]).toEqual(jasmine.any(Object))
      expect(atom.workspace.addTopPanel.calls[0].args[0].item).toEqual(jasmine.any(HTMLElement))
    })

    it('should render a the DOM node of the panel', function () {
      expect(this.viewCtrl.domNode).toEqual(jasmine.any(HTMLElement))
    })

    it('should render loading checklist', function () {
      expect(this.viewCtrl.domNode.innerHTML).toContain('loading')
    })
  })
})
