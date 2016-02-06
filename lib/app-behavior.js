'use babel'

import {React, ReactDOM} from 'react-for-atom'
import Bacon from 'baconjs'
import R from 'ramda'
import PanelComponent from './react/panel-component'

// Application behavior
// Should not contain any references to the atom.* objects!
// It should neither have any knowledge per se about the project object, that's also a detail for the limitation of
// working with a node process from inside the Atom app.
export default class Behavior {

  constructor ({domNode, panelHeightStream, isLoadingFilesProp, filesProp, resultsProp, focusOnSearchStream, deselectStream}) {
    this._domNode = domNode

    const keyDownBus = new Bacon.Bus()
    const selectIndexBus = new Bacon.Bus()
    const escKeyStream = keyDownBus.filter(R.propEq('keyCode', 27))
    const downKeyStream = keyDownBus.filter(R.propEq('keyCode', 40)).doAction('.preventDefault')
    const upKeyStream = keyDownBus.filter(R.propEq('keyCode', 38)).doAction('.preventDefault')

    // Selection is a semi-complicated piece; Keep an internal datastucture that keep tabs on path/item/index,
    // to be able to re-calculate them on state changes
    const selectedProp = Bacon
      .update(
        {},
        [deselectStream], R.always({}),
        [escKeyStream], R.always({}),

        // Selected next item
        [downKeyStream, filesProp, resultsProp], (current, _, files, {items}) => {
          const i = R.defaultTo(-1, current.index) + 1 // start on first item
          const nextItem = items[i]
          if (nextItem) {
            return {
              item: nextItem,
              path: files[nextItem.id].path,
              index: i
            }
          } else {
            return current // stop when reaching last item
          }
        },
        // Select prev item
        [upKeyStream, filesProp, resultsProp], (current, _, files, {items}) => {
          const i = R.defaultTo(items.length, current.index) - 1 // start on last item
          const prevItem = items[i]
          if (prevItem) {
            return {
              item: prevItem,
              path: files[prevItem.id].path,
              index: i
            }
          } else {
            return current // stop when reaching first item
          }
        },
        // User clicks on one of the visible item, change to that one directly
        [selectIndexBus, filesProp, resultsProp], (_, i, files, {items}) => {
          const item = items[i]
          return {
            item: item,
            path: files[item.id].path,
            index: i
          }
        },
        // Files changes (add/delete/order), update index from known path from current
        [filesProp.changes(), resultsProp], (current, files, {items}) => {
          const currentPath = current.path
          if (currentPath) {
            const i = items.findIndex(({id}) => files[id].path === currentPath)
            return {
              item: items[i],
              path: current.path,
              index: i
            }
          } else {
            return current // stay with current
          }
        }
      ).skipDuplicates()

    const reactPanel = ReactDOM.render(
      <PanelComponent focusOnSearchStream={focusOnSearchStream.merge(selectIndexBus.map(true))}
        panelHeightStream={panelHeightStream}
        filesProp={filesProp}
        resultsProp={resultsProp}
        isLoadingFilesProp={isLoadingFilesProp}
        selectIndexBus={selectIndexBus}
        selectedIndexStream={selectedProp.changes().map('.index')}
        keyDownBus={keyDownBus}
      />, this._domNode)

    this.panelHeightProp = reactPanel.panelHeightProp
    this.searchProp = reactPanel.searchProp
    this.openSelectionOrCreateFileStream = keyDownBus.filter(R.propEq('keyCode', 13)) // <enter>
    this.selectedFileProp = Bacon
      .combineWith(selectedProp, filesProp, (selected, files) => {
        const id = R.path(['item', 'id'], selected)
        return files[id]
      })
  }

  dispose () {
    ReactDOM.unmountComponentAtNode(this._domNode)
    this._domNode = null
  }
}
