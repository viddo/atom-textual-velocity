/* @flow */

import * as A from "../action-creators";

export default function makeNotesReducer(
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
    initialScan: InitialScan
  ) {
    switch (action.type) {
      case A.INITIAL_SCAN_DONE:
        return initialScan.rawFiles.reduce((nextNotes, rawFile) => {
          const note = state[rawFile.filename] || newNote(rawFile);
          nextNotes[rawFile.filename] = noteWithUpdatedFields(
            note,
            rawFile.filename
          );
          return nextNotes;
        }, {});

      case A.FILE_ADDED:
        if (!initialScan.done) return state;

        return {
          ...state,
          [action.rawFile.filename]: newNote(action.rawFile)
        };

      case A.FILE_READ:
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

      case A.FILE_DELETED:
        const deletedFilename = action.filename;
        return Object.keys(state).reduce((nextNotes, filename) => {
          if (filename !== deletedFilename) {
            nextNotes[filename] = state[filename];
          }
          return nextNotes;
        }, {});

      default:
        return state;
    }
  };
}
