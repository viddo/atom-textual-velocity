'use babel'

import {React, ReactDOM} from 'react-for-atom'
import Bacon from 'baconjs'
import R from 'ramda'
import PanelComponent from './react/panel-component'
import SummaryComponent from './react/cells/summary-component'
import DateTimeComponent from './react/cells/date-time-component'
import TagsComponent from './react/cells/tags-component'

// UI class, representing the presentation logic
//
// Note that all logic here should not have any traces or references to the atom.* objects.
// Basically it should be able to work in any context, least the provided streams fulfills the contract.
export default class UI {

  constructor ({domNode, project, panelHeightStream, focusOnSearchStream, deselectStream}) {
    this._domNode = domNode

    const keyDownBus = new Bacon.Bus()
    keyDownBus.doLog('[UI keydownBus]')
    const escKeyStream = keyDownBus.filter(R.propEq('keyCode', 27))
    const downKeyStream = keyDownBus.filter(R.propEq('keyCode', 40)).doAction('.preventDefault')
    const upKeyStream = keyDownBus.filter(R.propEq('keyCode', 38)).doAction('.preventDefault')
    const selectIndexBus = new Bacon.Bus()

    // Selection is a semi-complicated piece; Keep an internal datastucture that keep tabs on path/item/index,
    // to be able to re-calculate them on state changes
    const selectedProp = Bacon
      .update(
        {},
        [deselectStream], R.always({}),
        [escKeyStream], R.always({}),

        // Selected next item
        [downKeyStream, project.filesProp, project.resultsProp], (current, _, files, {items}) => {
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
        [upKeyStream, project.filesProp, project.resultsProp], (current, _, files, {items}) => {
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
        [selectIndexBus, project.filesProp, project.resultsProp], (_, i, files, {items}) => {
          const item = items[i]
          return {
            item: item,
            path: files[item.id].path,
            index: i
          }
        },
        // Files changes (add/delete/order), update index from known path from current
        [project.filesProp.changes(), project.resultsProp], (current, files, {items}) => {
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

    const columns = []
    columns.push({
      title: 'Name',
      width: 50,
      createCell: (file, state) => {
        return <SummaryComponent key='name' file={file}
        searchStr={state.searchStr} tokens={state.results.tokens} />
      }
    })
    if (project.darwin) {
      columns.push({
        title: 'Tags',
        width: 20,
        createCell: (file, state, isSelected) => {
          const saveTags = tags => project.darwin.setTags(file.path, tags.trim().split(' '))
          return (
            <TagsComponent key='tags' tags={file.tags} isSelected={isSelected} saveTags={saveTags} />
          )
        }
      })
    }
    columns.push({
      title: 'Date modified',
      width: 15,
      createCell: file => {
        return <DateTimeComponent key='mtime' time={file.stat.mtime} />
      }
    })
    columns.push({
      title: 'Date created',
      width: 15,
      createCell: file => {
        return <DateTimeComponent key='birhtime' time={file.stat.birthtime} />
      }
    })

    const reactPanel = ReactDOM.render(
      <PanelComponent focusOnSearchStream={focusOnSearchStream.merge(selectIndexBus.map(true))}
        panelHeightStream={panelHeightStream}
        filesProp={project.filesProp}
        resultsProp={project.resultsProp}
        isLoadingFilesProp={project.isLoadingFilesProp}
        selectIndexBus={selectIndexBus}
        selectedIndexStream={selectedProp.changes().map('.index')}
        keyDownBus={keyDownBus}
        columns={columns}
      />, this._domNode)

    this.panelHeightProp = reactPanel.panelHeightProp
    this.searchProp = reactPanel.searchProp
    this.selectedFileProp = selectedProp
      .combine(project.filesProp, (selected, files) => {
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
