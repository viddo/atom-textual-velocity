/* @flow */
import {FILE_ADDED, FILE_DELETED, INITIAL_SCAN_DONE} from '../action-creators'

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

  return function notesReducer (state: Notes = {}, action: Action, nextInitialScan: InitialScan) {
    switch (action.type) {
      case INITIAL_SCAN_DONE:
        return nextInitialScan.rawFiles
          .reduce((notes, rawFile) => {
            notes[rawFile.filename] = newNote(rawFile)
            return notes
          }, {})

      case FILE_ADDED:
        if (nextInitialScan.done) {
          state[action.rawFile.filename] = newNote(action.rawFile)
        }
        return state

      case FILE_DELETED:
        delete state[action.filename]
        return state

      default:
        return state
    }
  }
}
