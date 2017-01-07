/* @flow */
import * as A from '../action-creators'

export default function setupNotesReducer (notesFields: NotesFields) {
  const newNote = (rawFile, fields) => {
    const note = {
      id: process.hrtime().toString(),
      stats: rawFile.stats
    }

    notesFields.all().forEach(field => {
      if (field.value) {
        note[field.notePropName] = field.value(note, rawFile.filename)
      }
      return note
    })

    return note
  }

  return function notesReducer (state: Notes = {}, action: Action, initialScan: InitialScan) {
    switch (action.type) {
      case A.INITIAL_SCAN_DONE:
        return initialScan.rawFiles
          .reduce((notes, rawFile) => {
            notes[rawFile.filename] = newNote(rawFile)
            return notes
          }, {})

      case A.FILE_ADDED:
        if (initialScan.done) {
          return {
            ...state,
            [action.rawFile.filename]: newNote(action.rawFile)
          }
        }
        return state

      case A.FILE_DELETED:
        const nextState = {...state}
        delete nextState[action.filename]
        return nextState

      default:
        return state
    }
  }
}
