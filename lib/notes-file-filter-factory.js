/* @flow */

import NotesFileFilter from './notes-file-filter'

export default (dir: string) => {
  return new NotesFileFilter(dir, {
    exclusions: atom.config.get('textual-velocity.ignoredNames'),
    excludeVcsIgnoredPaths: atom.config.get('textual-velocity.excludeVcsIgnoredPaths')
  })
}
