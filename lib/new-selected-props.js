'use babel'

import Bacon from 'baconjs'
import R from 'ramda'

// TODO remove the need for path to be known, set a unique id on each path file item instead
export default function ({filesProp, resultsProp, keyDownBus, selectPathBus, activePathStream, deselectStream}) {
  const escKeyStream = keyDownBus.filter(R.propEq('keyCode', 27))
  const downKeyStream = keyDownBus.filter(R.propEq('keyCode', 40)).doAction('.preventDefault')
  const upKeyStream = keyDownBus.filter(R.propEq('keyCode', 38)).doAction('.preventDefault')
  const pathStream = activePathStream.merge(selectPathBus)

  // Selection is a semi-complicated piece; Keep an internal datastucture that keep tabs on path/item/index,
  // to be able to re-calculate them on state changes
  const selectedProp = Bacon
    .update(
      {},
      [deselectStream], R.always({}),
      [escKeyStream], R.always({}),

      // <Down>; Select next item
      [downKeyStream, filesProp, resultsProp], (current, _, files, {items}) => {
        const i = R.defaultTo(-1, current.index) + 1 // start on first item
        const nextItem = items[i]
        if (nextItem) {
          return {
            path: files[nextItem.id].path,
            index: i
          }
        } else {
          return current // stop when reaching last item
        }
      },
      // <Up>; Select prev item
      [upKeyStream, filesProp, resultsProp], (current, _, files, {items}) => {
        const i = R.defaultTo(items.length, current.index) - 1 // start on last item
        const prevItem = items[i]
        if (prevItem) {
          return {
            path: files[prevItem.id].path,
            index: i
          }
        } else {
          return current // stop when reaching first item
        }
      },
      [pathStream, filesProp, resultsProp], (current, newPath, files, {items}) => {
        if (newPath) {
          const i = items.findIndex(({id}) => files[id].path === newPath)
          if (i >= 0) {
            return {
              path: newPath,
              index: i
            }
          } else {
            return current
          }
        } else {
          return {}
        }
      },
      // Files changes (add/delete/order), update index from known path from current
      [filesProp.changes(), resultsProp], (current, files, {items}) => {
        const currentPath = current.path
        if (currentPath) {
          const i = items.findIndex(({id}) => files[id].path === currentPath)
          return {
            path: current.path,
            index: i
          }
        } else {
          return current // stay with current
        }
      }
    )
    .skipDuplicates()

  const selectedStream = selectedProp.changes()
  return {
    selectedIndexStream: selectedStream.map('.index'),
    selectedPathStream: selectedStream.map('.path')
  }
}
