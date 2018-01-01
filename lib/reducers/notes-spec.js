/* @flow */

import * as A from "../actions";
import FileReaders from "../file-readers";
import NoteFields from "../note-fields";
import newNotesReducer from "./notes";

describe("reducers/notes", () => {
  let state: Notes;
  let notesReducer;

  beforeEach(function() {
    const fileReaders = new FileReaders();
    fileReaders.add({
      notePropName: "content",
      read: (path: string, fileStats: fs.Stats, callback: NodeCallback) =>
        callback(null, `content for ${path}`)
    });

    const noteFields = new NoteFields();
    noteFields.add({
      notePropName: "name",
      value: (note, filename) => filename.split(".")[0]
    });
    noteFields.add({
      notePropName: "ext",
      value: (note, filename) => filename.split(".").slice(-1)[0]
    });

    // Some fields are set by a file-reader, in those cases the field is only there to indicate that the field exist
    noteFields.add({ notePropName: "content" });

    notesReducer = newNotesReducer(fileReaders, noteFields);
    state = notesReducer(undefined, A.search(""));
  });

  it("should have an empty object", function() {
    expect(state).toEqual({});
  });

  describe("when initial-scan-done action", function() {
    beforeEach(function() {
      const rawFiles = [
        {
          filename: "a.txt",
          stats: { mtime: new Date() }
        },
        {
          filename: "b.md",
          stats: { mtime: new Date() }
        }
      ];
      state = notesReducer(state, A.readDirDone(rawFiles));
    });

    it("should reduce notes from raw notes", function() {
      expect(Object.keys(state).length).toEqual(2);
    });

    it("should apply noteFields on notes", function() {
      expect(state["a.txt"]).toEqual(jasmine.any(Object));
      expect(state["a.txt"].name).toEqual("a");
      expect(state["a.txt"].ext).toEqual("txt");
      expect(state["b.md"].name).toEqual("b");
      expect(state["b.md"].ext).toEqual("md");
    });

    it("should set an unique id on the note", function() {
      expect(state["a.txt"].id).toEqual(jasmine.any(String));
    });

    it("should set stats object on note", function() {
      expect(state["a.txt"].stats).toEqual(jasmine.any(Object));
    });
  });

  describe("when file is added", function() {
    let action;
    let prevState;

    beforeEach(function() {
      prevState = {
        "alice.txt": {
          id: "1",
          stats: { mtime: new Date() },
          ready: false,
          ext: "txt",
          name: "alice"
        },
        "bob.md": {
          id: "2",
          stats: { mtime: new Date() },
          ready: false,
          ext: "md",
          name: "bob"
        }
      };
      action = A.fileAdded({
        filename: "cesar.txt",
        stats: { mtime: new Date() }
      });

      state = notesReducer(prevState, action);
    });

    it("should add new notes", function() {
      expect(state["cesar.txt"]).toEqual({
        id: jasmine.any(String),
        stats: { mtime: jasmine.any(Date) },
        ready: false,
        ext: "txt",
        name: "cesar"
      });
    });

    describe("when file is renamed", function() {
      beforeEach(function() {
        action = A.fileRenamed({
          filename: "Julius Caesar.md",
          oldFilename: "cesar.txt"
        });
        state = notesReducer(state, action);
      });

      it("should rename the notes key for renamed file", function() {
        expect(Object.keys(state)).toEqual([
          "alice.txt",
          "bob.md",
          "Julius Caesar.md"
        ]);
        expect(state["Julius Caesar.md"]).toEqual(
          jasmine.objectContaining({
            name: "Julius Caesar",
            ext: "md"
          })
        );
      });
    });

    describe("when file is removed", function() {
      beforeEach(function() {
        action = A.fileDeleted("cesar.txt");
        state = notesReducer(state, action);
      });

      it("should remove corresponding note", function() {
        expect(state).toEqual(prevState);
      });
    });

    describe("when a file is read", function() {
      beforeEach(function() {
        action = A.fileRead({
          filename: "bob.md",
          notePropName: "content",
          value: "content for bob.md"
        });
        state = notesReducer(prevState, action);
      });

      it("should add field to intended note", function() {
        expect(state["bob.md"].content).toEqual("content for bob.md");
        expect(state["alice.txt"].content).toEqual();
      });

      it("should set note with all fields as ready", function() {
        expect(state["bob.md"].ready).toBe(true);
        expect(state["alice.txt"].ready).toBe(false);
      });
    });
  });
});
