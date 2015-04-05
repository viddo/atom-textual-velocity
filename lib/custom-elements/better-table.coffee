class BetterTable extends HTMLTableElement

  initialize: ->

module.exports = document.registerElement 'better-table', {
  prototype: BetterTable.prototype,
  extends:   'table'
}
