/* @flow */

import NVtags from "../../lib/NVtags";
import NVtagsFileReader from "../../lib/nv-tags/NVtagsFileReader";

if (!NVtags.unsupportedError) {
  describe("NVtagsFileReader", () => {
    let callback, fileReader;

    beforeEach(() => {
      spyOn(NVtags, "read");
      callback = jasmine.createSpy("callback");
      fileReader = new NVtagsFileReader();
    });

    it("has note prop name", function () {
      expect(fileReader.notePropName).toMatch(/\w{1,}/);
    });

    it("reads tags to file of given path", () => {
      const stats: any = null;
      fileReader.read("/notes/file.md", stats, callback);
      expect(NVtags.read).toHaveBeenCalledWith("/notes/file.md", callback);
    });
  });
}
