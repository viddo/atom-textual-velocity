'use babel'
import fs from 'fs'
import {PathSearcher} from 'scandal'

export default function (paths, searchStr, emit, doneCallback) {
  const searcher = new PathSearcher()

  searcher.on('results-found', r => {
    emit('results', {
      path: r.filePath,
      preview: r.matches[0].lineText,
      stat: fs.statSync(r.filePath)
    })
  })

  searcher.searchPaths(new RegExp(searchStr, 'gi'), paths, doneCallback)
}
