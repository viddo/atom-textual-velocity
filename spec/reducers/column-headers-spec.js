/* @flow */

import {initialScanDone} from '../../lib/action-creators'
import Columns from '../../lib/columns'
import FileIconColumn from '../../lib/columns/file-icon-column'
import SummaryColumn from '../../lib/columns/summary-column'
import setupColumnHeadersReducer from '../../lib/reducers/column-headers'

describe('reducers/column-headers', () => {
  let state
  let columnHeadersReducer

  beforeEach(function () {
    const columns = new Columns()
    columns.add(new SummaryColumn({sortField: 'name', editCellName: ''}))
    columns.add(new FileIconColumn({sortField: 'ext'}))

    columnHeadersReducer = setupColumnHeadersReducer(columns)
  })

  it('should return defaults when state is missing', function () {
    state = columnHeadersReducer(state, initialScanDone())
    expect(state).toEqual(jasmine.any(Array))

    expect(state[0].sortField).toEqual(jasmine.any(String))
    expect(state[0].title).toEqual(jasmine.any(String))
    expect(state[0].width).toEqual(jasmine.any(Number))
  })
})
