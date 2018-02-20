/* @flow */

import NVtags from "./NVtags";
import Columns from "./Columns";
import registerNVtags from "./registerNVtags";

if (NVtags.unsupportedError) {
  describe("registerNVtags", () => {
    let columns;

    beforeEach(function() {
      columns = new Columns();
      spyOn(columns, "add");
    });

    it("should not have registered anything", () => {
      registerNVtags(columns);
      expect(columns.add).not.toHaveBeenCalled();
    });
  });
} else {
  describe("registerNVtags", () => {
    let columns;

    beforeEach(() => {
      columns = new Columns();
      spyOn(columns, "add");
      spyOn(NVtags, "read");

      registerNVtags(columns);
      expect(columns.add).toHaveBeenCalled();
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
