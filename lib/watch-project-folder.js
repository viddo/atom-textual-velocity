'use babel'
import fs from 'fs'
import {PathScanner} from 'scandal'

export default function (projectPath, ignoredNames, excludeVcsIgnores, emit) {
  const scanner = new PathScanner(projectPath, {
    excludeVcsIgnores: excludeVcsIgnores,
    excludes: ignoredNames
  })

  scanner.on('path-found', (path) => {
    emit('add', {
      path: path,
      stat: fs.statSync(path)
    })
  })
  scanner.scan()
}
