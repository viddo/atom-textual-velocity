/* @flow */

const restartExplanation = '_Changing this setting requires restarting the session._'
const concurrentValueConsequenceExplanation = 'A higher value might (but no guarantee) make the processing a little faster, but makes the Atom GUI less responsive.'

const cfg = {
  path: {
    description: `${restartExplanation}<br/>Path to folder where to find notes. Can be an absolute path or a relative path to \`~/.atom\` (defaults to \`~/.atom/notes\`)`,
    type: 'string',
    default: ''
  },
  ignoredNames: {
    type: 'array',
    default: ['Notes & Settings'],
    items: {
      type: 'string'
    },
    description: `${restartExplanation}<br/>List of [glob patterns](https://en.wikipedia.org/wiki/Glob_%28programming%29). Files matching these patterns will be ignored, in addition to the ignoredNames defined in core settings`
  },
  excludeVcsIgnoredPaths: {
    type: 'boolean',
    default: true,
    title: 'Exclude VCS Ignored Paths',
    description: `${restartExplanation}<br/>Files ignored by the the notes path's VCS system will be ignored. For example, projects using Git have these paths defined in the .gitignore file.`
  },
  sortField: {
    default: 'name',
    type: 'string'
  },
  sortDirection: {
    type: 'string',
    default: 'desc',
    enum: [
      {value: 'asc', description: 'Ascending order'},
      {value: 'desc', description: 'Descending order'}
    ]
  },
  defaultExt: {
    title: 'Default file extension',
    description: 'Will be used for new files, unless the text string contains a custom file extension already',
    type: 'string',
    default: '.md'
  },
  listHeight: {
    description: 'Height of panel, can also be changed by dragging the bottom of panel',
    type: 'number',
    default: 150,
    minimum: 0
  },
  rowHeight: {
    description: 'Internal cached value, used to calculate pagination size',
    type: 'number',
    default: 20,
    minimum: 8,
    maximum: 80
  },
  concurrentFilesParses: {
    description: `${restartExplanation}<br/>Defines how many files to parse concurrently when the initial dir scan is done.<br/>${concurrentValueConsequenceExplanation}`,
    type: 'number',
    default: 3,
    minimum: 0
  },
  concurrentFileReads: {
    description: `${restartExplanation}<br/>Defines how many concurrent read operations to do per file.<br/>${concurrentValueConsequenceExplanation}`,
    type: 'number',
    default: 3,
    minimum: 0
  }
}

Object
  .keys(cfg)
  .forEach((key, i) => {
    const setting: Object = cfg[key]
    setting.order = i
  })

export default cfg
