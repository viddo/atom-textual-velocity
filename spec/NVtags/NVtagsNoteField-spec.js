/* @flow */

import NVtagsNoteField from "../../lib/nv-tags/NVtagsNoteField";

describe("NVtagsNoteField", () => {
  let noteField;

  beforeEach(() => {
    noteField = new NVtagsNoteField();
  });

  it("has note prop name", function() {
    expect(noteField.notePropName).toMatch(/\w{1,}/);
  });

  describe(".value", () => {
    it("should return the tags as a space separated string", () => {
      const note: any = { nvtags: ["beep", "boop"] };
      expect(noteField.value(note)).toEqual("beep boop");
    });

    it("should return nothing for nonvalid prop", () => {
      const note: any = { nvtags: {} };
      expect(noteField.value(note)).toBeFalsy();

      const note2: any = { nvtags: null };
      expect(noteField.value(note2)).toBeFalsy();
    });
  });
});
