/* @flow */

import Bacon from 'baconjs'

export default class PropWrapper {

  prop: Bacon.Property

  _addBus: Bacon.Bus
  _removeBus: Bacon.Bus
  _unsubscribe: Function

  constructor () {
    this._addBus = new Bacon.Bus()
    this._removeBus = new Bacon.Bus()

    this.prop = Bacon.update(
      [],
      [this._addBus], (list, newItem) => {
        if (isNaN(newItem.position)) {
          list.push(newItem)
        } else {
          list.splice(newItem.position, 0, newItem)
        }
        return list
      },
      [this._removeBus], (list, itemToRemove) => {
        return list.filter(item => item !== itemToRemove)
      })

    this._unsubscribe = this.prop.onValue(() => {}) // no-op, for values to work w/o subscribers
  }

  add (newItem: Object) {
    this._addBus.push(newItem)
  }

  remove (itemToRemove: Object) {
    this._removeBus.push(itemToRemove)
  }

  dispose () {
    this._unsubscribe()
    this._addBus.end()
    this._removeBus.end()
  }
}
