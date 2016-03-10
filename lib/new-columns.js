'use babel'

import {React} from 'react-for-atom'
import * as atoms from './atom-streams'
import DateTimeComponent from './react/cells/date-time-component'
import SummaryComponent from './react/cells/summary-component'
import TagsComponent from './react/cells/tags-component'

export default function (darwin) {
  const columns = []

  columns.push({
    title: 'Name',
    width: 50,
    sortField: 'name',
    createCell: (file, state) => {
      return <SummaryComponent key='name' file={file} searchStr={state.searchStr} tokens={state.results.tokens} />
    }
  })

  if (darwin) {
    const editTagsStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:edit-tags')
    columns.push({
      title: 'Tags',
      width: 20,
      sortField: 'tags',
      createCell: (file, state, isSelected) => {
        const saveTags = tags => darwin.setTags(file.path, tags.trim().split(' '))
        return (
          <TagsComponent key='tags' tags={file.tags} isSelected={isSelected} saveTags={saveTags}
            editTagsStream={editTagsStream} />
        )
      }
    })
  }

  columns.push({
    title: 'Date modified',
    width: 15,
    sortField: 'mtimestamp',
    createCell: file => {
      return <DateTimeComponent key='mtime' time={file.stat.mtime} />
    }
  })

  columns.push({
    title: 'Date created',
    width: 15,
    sortField: 'birthtimestamp',
    createCell: file => {
      return <DateTimeComponent key='birhtime' time={file.stat.birthtime} />
    }
  })

  return columns
}
