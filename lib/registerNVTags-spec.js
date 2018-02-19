/* @flow */

import NVtags from "./NVtags";
import Columns from "./Columns";
import FileReaders from "./FileReaders";
import NoteFields from "./NoteFields";
import registerNVtags from "./registerNVtags";

if (NVtags.unsupportedError) {
  describe("registerNVtags", () => {
    let columns, fileReaders, noteFields;

    beforeEach(function() {
      columns = new Columns();
      fileReaders = new FileReaders();
      noteFields = new NoteFields();
      spyOn(columns, "add");
      spyOn(fileReaders, "add");
      spyOn(noteFields, "add");
    });

    it("should not have registered anything", () => {
      registerNVtags(columns, fileReaders, noteFields);
      expect(columns.add).not.toHaveBeenCalled();
      expect(fileReaders.add).not.toHaveBeenCalled();
      expect(noteFields.add).not.toHaveBeenCalled();
    });
  });
} else {
  describe("registerNVtags", () => {
    let columns, fileReaders, noteFields;

    beforeEach(() => {
      columns = new Columns();
      fileReaders = new FileReaders();
      noteFields = new NoteFields();
      spyOn(columns, "add");
      spyOn(fileReaders, "add");
      spyOn(noteFields, "add");
      spyOn(NVtags, "read");

      registerNVtags(columns, fileReaders, noteFields);
      expect(columns.add).toHaveBeenCalled();
      expect(fileReaders.add).toHaveBeenCalled();
      expect(noteFields.add).toHaveBeenCalled();
    });

    describe("registered field", () => {
      let field;

      beforeEach(() => {
        field = noteFields.add.mostRecentCall.args[0];
      });

      describe(".value", () => {
        it("should return the tags as a space separated string", () => {
          expect(field.value({ nvtags: ["beep", "boop"] })).toEqual(
            "beep boop"
          );
        });

        it("should return nothing for nonvalid prop", () => {
          expect(field.value({ nvtags: {} })).toBeFalsy();
          expect(field.value({ nvtags: null })).toBeFalsy();
        });
      });
    });

    describe("registered column", () => {
      let column;

      beforeEach(() => {
        column = columns.add.mostRecentCall.args[0];
      });

      describe(".cellContent", () => {
        it("should return the tags as a space separated string", () => {
          const note = { nvtags: ["beep", "boop"] };
          const cellContent = column.cellContent({ note: note });

          expect(cellContent).toEqual(jasmine.any(Array));
          expect(cellContent[0]).toEqual({
            attrs: jasmine.any(Object),
            content: "beep"
          });
        });

        it("should return nothing for nonvalid prop", () => {
          expect(column.cellContent({ note: { nvtags: {} } })).toBeFalsy();
          expect(column.cellContent({ note: { nvtags: null } })).toBeFalsy();
        });
      });
    });

    describe("registered file reader", () => {
      let callback, fileReader;

      beforeEach(() => {
        callback = jasmine.createSpy("callback");
        fileReader = fileReaders.add.mostRecentCall.args[0];
      });

      it("should write/read tags to file of given path", () => {
        fileReader.read("/notes/file.md", {}, callback);
        expect(NVtags.read).toHaveBeenCalledWith("/notes/file.md", callback);
      });
    });
  });
}
