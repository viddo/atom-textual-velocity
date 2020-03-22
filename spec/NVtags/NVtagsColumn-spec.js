/* @flow */

import NVtagsColumn from "../../lib/nv-tags/NVtagsColumn";

describe("NVtagsColumn", () => {
  let column;

  beforeEach(() => {
    column = new NVtagsColumn();
  });

  describe(".cellContent", () => {
    it("should return the tags as a space separated string", () => {
      const note = { nvtags: ["beep", "boop"] };
      const params: any = { note: note };
      const cellContent: any = column.cellContent(params);

      expect(cellContent).toEqual(jasmine.any(Array));
      expect(cellContent[0]).toEqual({
        attrs: jasmine.any(Object),
        content: "beep",
      });
    });

    it("should return nothing for nonvalid prop", () => {
      {
        const params: any = { note: { nvtags: {} } };
        expect(column.cellContent(params)).toBeFalsy();
      }
      {
        const params: any = { note: { nvtags: null } };
        expect(column.cellContent(params)).toBeFalsy();
      }
    });
  });
});
