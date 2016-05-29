'use babel'

/**
 * Calculate appropriate pagination for a list that contains a set of items with uniform height.
 */
export default class ListPagination {

  constructor ({listHeight, itemHeight}) {
    this._listHeight = listHeight
    this._itemHeight = itemHeight
  }

  visibleCount () {
    return Math.ceil(this._listHeight / this._itemHeight)
  }

}
