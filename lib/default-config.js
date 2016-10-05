/* @flow */

export default {
  path: {
    order: 1,
    description: '_Changing this setting requires restarting the session._<br/>Path to folder where to find notes. Can be an absolute path or a relative path to `~/.atom` (defaults to `~/.atom/notes`)',
    type: 'string',
    default: ''
  },
  sortField: {
    order: 2,
    default: 'name',
    type: 'string'
  },
  sortDirection: {
    order: 3,
    type: 'string',
    default: 'desc',
    enum: [
      {value: 'asc', description: 'Ascending order'},
      {value: 'desc', description: 'Descending order'}
    ]
  },
  defaultExt: {
    order: 4,
    title: 'Default file extension',
    description: 'Will be used for new files, unless the text string contains a custom file extension already',
    type: 'string',
    default: '.md'
  },
  listHeight: {
    order: 5,
    description: 'Height of panel, can also be changed by dragging the bottom of panel',
    type: 'number',
    default: 150,
    minimum: 0
  },
  rowHeight: {
    order: 6,
    description: 'Internal cached value, used to calculate pagination size',
    type: 'number',
    default: 20,
    minimum: 8,
    maximum: 80
  }
}
