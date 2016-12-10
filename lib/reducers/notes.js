/* @flow */

const notes = (notesFields: NotesFieldsType) =>
  (state: NotesStateType, action: ActionType, rawFiles: Array<RawFileType>) => {
    if (state === undefined) state = {}
    switch (action.type) {
      case 'INITIAL_SCAN_DONE':
        const fields = notesFields.all()
        return rawFiles
          .reduce((notes, rawFile) => {
            const note = {
              id: process.hrtime().toString(),
              stats: rawFile.stats
            }

            notes[rawFile.filename] = fields.reduce((note, field) => {
              if (field.value) {
                note[field.notePropName] = field.value(note, rawFile.filename)
              }
              return note
            }, note)

            return notes
          }, {})
      default:
        return state
    }
  }

export default notes
