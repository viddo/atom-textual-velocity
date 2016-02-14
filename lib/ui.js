'use babel'

import {React, ReactDOM} from 'react-for-atom'
import Bacon from 'baconjs'
import R from 'ramda'
import PanelComponent from './react/panel-component'

// UI class, representing the presentation logic
//
// Note that all logic here should not have any traces or references to the atom.* objects.
// Basically it should be able to work in any context, least the provided streams fulfills the contract.
export default class UI {

  constructor ({domNode, isLoadingFilesProp, filesProp, resultsProp, columns, panelHeightStream, focusOnSearchStream, deselectStream}) {
    this._domNode = domNode

    const keyDownBus = new Bacon.Bus()
    keyDownBus.doLog('[UI keydownBus]')
    const escKeyStream = keyDownBus.filter(R.propEq('keyCode', 27))
    const downKeyStream = keyDownBus.filter(R.propEq('keyCode', 40)).doAction('.preventDefault')
    const upKeyStream = keyDownBus.filter(R.propEq('keyCode', 38)).doAction('.preventDefault')
    const selectIndexBus = new Bacon.Bus()
    const selectIndexStream = selectIndexBus.skipDuplicates()

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
        [selectIndexStream, filesProp, resultsProp], (_, i, files, {items}) => {
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

    focusOnSearchStream = Bacon.mergeAll(
      focusOnSearchStream,
      selectIndexStream.map(true),
      filesProp.changes()
    )

    const reactPanel = ReactDOM.render(
      <PanelComponent focusOnSearchStream={focusOnSearchStream}
        panelHeightStream={panelHeightStream}
        filesProp={filesProp}
        resultsProp={resultsProp}
        isLoadingFilesProp={isLoadingFilesProp}
        selectIndexBus={selectIndexBus}
        selectedIndexStream={selectedProp.changes().map('.index')}
        keyDownBus={keyDownBus}
        columns={columns}
      />, this._domNode)

    this.panelHeightProp = reactPanel.panelHeightProp
    this.searchProp = reactPanel.searchProp
    this.selectedFileProp = selectedProp
      .combine(filesProp, (selected, files) => {
        const id = R.path(['item', 'id'], selected)
        return files[id]
      })

    const enterKeyStream = keyDownBus
      .filter(R.propEq('keyCode', 13))
      .doLog('[UI_enterKeyStream]')
    const selectedFilePathOnEnterStream = this.selectedFileProp
      .map('.path')
      .skipDuplicates()
      .sampledBy(enterKeyStream)
      .doLog('[UI_selectedFilePathOnEnterStream]')

    this.openFileStream = selectedFilePathOnEnterStream
      .filter(R.identity)
      .doLog('[UI.openFileStream]')

    this.createFileStream = Bacon
      .when(
        [selectedFilePathOnEnterStream.filter(R.not), this.searchProp],
        (_, searchStr) => {
          return searchStr.trim()
        }
      )
      .doLog('[UI.createFileStream]')

    // Just for testing purposes
    this._reactPanel = reactPanel
  }

  dispose () {
    ReactDOM.unmountComponentAtNode(this._domNode)
    this._domNode = null
  }
}
