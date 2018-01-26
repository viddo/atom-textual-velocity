/* @flow */

import fs from "fs";
import Path from "path";
import registerRenameNote from "./registerRenameNote";

describe("registerRenameNote", function() {
  const editCellName = "bampadam";
  let disposable, fileWriters;

  beforeEach(function() {
    fileWriters = jasmine.createSpyObj("fileWriters", ["add"]);
    disposable = registerRenameNote(fileWriters, editCellName);
  });

  afterEach(function() {
    disposable.dispose();
  });

  describe("registered file writer", function() {
    let fileWriter;

    beforeEach(function() {
      expect(fileWriters.add).toHaveBeenCalled();
      fileWriter = fileWriters.add.mostRecentCall.args[0];
    });

    it("should have a edit cell name", function() {
      expect(fileWriter.editCellName).toEqual(editCellName);
    });

    describe(".write", function() {
      let callbackSpy;
      let oldPath;

      beforeEach(function() {
        oldPath = "/path/to/notes/old-file-path.txt";
        spyOn(fs, "renameSync");
        spyOn(fs, "utimesSync");
        callbackSpy = jasmine.createSpy("callback");
      });

      it("should do nothing if given empty value", function() {
        fileWriter.write(oldPath, "", callbackSpy);
        expect(fs.renameSync).not.toHaveBeenCalled();
        expect(callbackSpy).toHaveBeenCalledWith(null, null);
      });

      it("should not allow path separator", function() {
        const str = Path.join("only", "use", "this-last-piece.txt");
        fileWriter.write(oldPath, str, callbackSpy);
        expect(fs.renameSync).toHaveBeenCalledWith(
          oldPath,
          "/path/to/notes/this-last-piece.txt"
        );
        expect(callbackSpy).toHaveBeenCalledWith(null, null);
      });

      it("should trim and normalize value", function() {
        fileWriter.write(oldPath, "  test.txt  ", callbackSpy);
        expect(fs.renameSync).toHaveBeenCalledWith(
          oldPath,
          "/path/to/notes/test.txt"
        );
        expect(callbackSpy).toHaveBeenCalledWith(null, null);
      });
    });
  });
});
