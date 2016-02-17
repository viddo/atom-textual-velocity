'use babel'

import Bacon from 'baconjs'
import R from 'ramda'

// TODO remove the need for path to be known, set a unique id on each path file item instead
export default function ({filesProp, resultsProp, keyDownBus, selectIndexBus, deselectStream}) {
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
    )
    .skipDuplicates()

  return {
    selectedIndexStream: selectedProp
      .changes()
      .map('.index'),

    selectedFileProp: Bacon
      .combineWith(selectedProp, filesProp, (selected, files) => {
        const id = R.path(['item', 'id'], selected)
        return files[id]
      })
  }
}
