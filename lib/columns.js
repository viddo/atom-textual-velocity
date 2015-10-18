'use babel'

import moment from 'moment'
import React from 'react-for-atom'
import Path from 'path'
import R from 'ramda'

let dateFromNow = R.pipe(R.path(R.__), moment, R.invoker(0, 'fromNow'))

export default [
  {
    title: 'Name',
    width: 60,
    cellContent: item => {
      let pieces = item.relPath.split(Path.sep)
      if (pieces.length > 1) {
        return (
          <span>
            <span className='text-subtle'>
              {pieces.slice(0, -1).join(Path.sep)}
              {Path.sep}
            </span>
            {pieces.slice(-1)}
          </span>
        )
      } else {
        return pieces[0]
      }
    }
  }, {
    title: 'Date created',
    width: 20,
    cellContent: dateFromNow(['stats', 'birthtime'])
  }, {
    title: 'Date modified',
    width: 20,
    cellContent: dateFromNow(['stats', 'mtime'])
  }
]
