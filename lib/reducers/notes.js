/* @flow */

import * as C from "../action-constants";

export default function newNotesReducer(
  fileReaders: FileReaders,
  noteFields: NoteFields
) {
  const noteWithUpdatedFields = (note: Note, filename: string) => {
    noteFields.forEach(noteField => {
      if (noteField.value) {
        note[noteField.notePropName] = noteField.value(note, filename);
      }
    });

    note.ready = fileReaders.every(
      fileReader => note[fileReader.notePropName] !== undefined
    );

    return note;
  };

  function newNote(rawFile: RawFile): Note {
    const note = {
      id: process.hrtime().toString(),
      stats: rawFile.stats,
      ready: false,
      // these are set by noteFields later:
      ext: "",
      name: ""
    };
    return noteWithUpdatedFields(note, rawFile.filename);
  }

  return function nextNotesReducer(
    state: Notes = {},
    action: Action,
    loading: LoadingState
  ) {
    switch (action.type) {
      case C.INITIAL_SCAN_DONE:
        return action.rawFiles.reduce((nextNotes, rawFile) => {
          const note = state[rawFile.filename] || newNote(rawFile);
          nextNotes[rawFile.filename] = noteWithUpdatedFields(
            note,
            rawFile.filename
          );
          return nextNotes;
        }, {});

      // Sometimes a rename is interpreted as a deleted + changed action, for whatever reason
      // So if such an event happens and there is no file create one for it
      case C.FILE_CHANGED:
      case C.FILE_ADDED:
        return {
          ...state,
          [action.rawFile.filename]: newNote(action.rawFile)
        };

      case C.FILE_READ:
        const { filename: readFilename, notePropName, value } = action;

        return Object.keys(state).reduce((nextNotes, filename) => {
          if (filename === readFilename) {
            const note = {
              ...state[filename],
              [notePropName]: value
            };
            nextNotes[filename] = noteWithUpdatedFields(note, filename);
          } else {
            nextNotes[filename] = state[filename];
          }
          return nextNotes;
        }, {});

      case C.FILE_RENAMED:
        if (state[action.oldFilename]) {
          const nextNotes = excludeNote(state, action.oldFilename);
          const note = state[action.oldFilename];
          nextNotes[action.filename] = noteWithUpdatedFields(
            note,
            action.filename
          );
          return nextNotes;
        } else {
          return state;
        }

      case C.FILE_DELETED:
        const deletedFilename = action.filename;
        return excludeNote(state, deletedFilename);

      default:
        return state;
    }
  };
}

function excludeNote(state, excludeFilename) {
  return Object.keys(state).reduce((nextNotes, filename) => {
    if (filename !== excludeFilename) {
      nextNotes[filename] = state[filename];
    }
    return nextNotes;
  }, {});
}
