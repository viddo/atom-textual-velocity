/* @flow */

import NVtags from "./NVtags";
import Columns from "./Columns";
import NoteFields from "./NoteFields";
import registerNVtags from "./registerNVtags";

if (NVtags.unsupportedError) {
  describe("registerNVtags", () => {
    let columns, noteFields;

    beforeEach(function() {
      columns = new Columns();
      noteFields = new NoteFields();
      spyOn(columns, "add");
      spyOn(noteFields, "add");
    });

    it("should not have registered anything", () => {
      registerNVtags(columns, noteFields);
      expect(columns.add).not.toHaveBeenCalled();
      expect(noteFields.add).not.toHaveBeenCalled();
    });
  });
} else {
  describe("registerNVtags", () => {
    let columns, noteFields;

    beforeEach(() => {
      columns = new Columns();
      noteFields = new NoteFields();
      spyOn(columns, "add");
      spyOn(noteFields, "add");
      spyOn(NVtags, "read");

      registerNVtags(columns, noteFields);
      expect(columns.add).toHaveBeenCalled();
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
  });
}
