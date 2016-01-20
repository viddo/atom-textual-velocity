'use babel'

import R from 'ramda'
import Bacon from 'baconjs'
import React from 'react-for-atom'
import atoms from './atom-streams'
import DisposableValues from './disposable-values'
import PanelComponent from './react/panel'

// Wrap the panel component, bridges between Atom context and the React panel component
class Panel {

  constructor (resultsProp, queryBus) {
    this._panelElement = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: this._panelElement})

    const isVisibleStream = atoms.createStream(this._atomPanel, 'onDidChangeVisible').filter(R.identity)
    const dblCancelStream = this._dblTapStream(atoms.createCancelCommandStream())

    const showStream = Bacon.mergeAll(
      dblCancelStream,
      isVisibleStream,
      atoms
        .createStream(atom.workspace, 'onDidChangeActivePaneItem')
        .filter(item => item === this._previewEditor)
    )

    const reactPanel = React.render(
      <PanelComponent showStream={showStream}
        bodyHeightStream={atoms.createConfigStream('notational.bodyHeight')}
        resultsProp={resultsProp}
      />, this._panelElement)

    queryBus.plug(
      Bacon.combineTemplate({
        searchStr: reactPanel.searchProp,
        paginationOffset: reactPanel.paginationOffsetProp,
        paginationSize: reactPanel.paginationSizeProp
      })
      .toEventStream() // using this instead of .changes() to trigger an initial query
    )

    const dblResetStream = this._dblTapStream(reactPanel.resetStream)

    // Open either on open-stream event from panel, or if clicking inside the previewEditor
    const openStream = Bacon
        .fromEvent(atom.views.getView(atom.workspace), 'click')
        .filter(ev => ev.srcElement === atom.views.getView(this._previewEditor))
        .merge(reactPanel.openStream)

    this.disposables = new DisposableValues(
      dblCancelStream.onValue(() => this._atomPanel.show()),

      reactPanel.bodyHeightProp.debounce(500).onValue(h => atom.config.set('notational.bodyHeight', h)),

      reactPanel.selectedItemProp.onValue(selectedItem => {
        if (selectedItem) {
          if (!this._previewEditor) {
            this._previewEditor = atom.workspace.buildTextEditor()
            this._previewEditor.getTitle = () => 'Notational Preview'
            this._previewEditor.onDidDestroy(() => this._previewEditor = null)
            this._previewEditor.buffer.isModified = R.always(false)
          }
          atom.workspace.getActivePane().activateItem(this._previewEditor)
          this._previewEditor.setText(selectedItem.content)
        } else if (this._previewEditor) {
          this._previewEditor.destroy()
        }
      }),

      reactPanel.selectedItemProp
        .filter(R.is(Object))
        .sampledBy(openStream)
        .onValue(selectedItem => {
          atom.workspace.open(selectedItem.path)
        }),

      dblResetStream.onValue(() => {
        this._atomPanel.hide()
        const activePane = atom.workspace.getActivePane()
        if (activePane) {
          activePane.activate()
        }
      })
    )
  }

  isVisible () {
    return this._atomPanel.isVisible()
  }

  show () {
    this._atomPanel.show()
    this._atomPanel.emitter.emit('did-change-visible', true) // force event, to trigger showStream above
  }

  dispose () {
    React.unmountComponentAtNode(this._panelElement)
    this._panelElement = null
    this._atomPanel.destroy()
    this._atomPanel = null

    this.disposables.dispose()
    this.disposables = null
  }

  // filter a given stream to only trigger if tow event are triggered within 300ms (e.g. dbl-ESC)
  _dblTapStream (stream) {
    return stream.bufferWithTimeOrCount(300, 2).filter(R.propEq('length', 2))
  }
}

export default Panel
