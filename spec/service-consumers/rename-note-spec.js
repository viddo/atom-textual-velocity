/* @flow */

import fs from "fs";
import Path from "path";
import renameNote from "../../lib/service-consumers/rename-note";

describe("service-consumers/rename-note", function() {
  describe(".consumeService", function() {
    const editCellName = "bampadam";
    let disposable, service;

    beforeEach(function() {
      service = {
        registerColumns: jasmine.createSpy("registerColumns"),
        registerFields: jasmine.createSpy("registerFields"),
        registerFileReaders: jasmine.createSpy("registerFileReaders"),
        deregisterFileReaders: jasmine.createSpy("deregisterFileReaders"),
        registerFileWriters: jasmine.createSpy("registerFileWriters"),
        editCell: jasmine.createSpy("editCell")
      };
      disposable = renameNote.consumeService(service, editCellName);
    });

    afterEach(function() {
      disposable.dispose();
    });

    describe("registered file writer", function() {
      let fileWriter;

      beforeEach(function() {
        expect(service.registerFileWriters).toHaveBeenCalled();
        fileWriter = service.registerFileWriters.mostRecentCall.args[0];
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
          expect(fs.utimesSync).not.toHaveBeenCalled();
          expect(callbackSpy).toHaveBeenCalledWith(null, null);
        });

        it("should not allow path separator", function() {
          const str = Path.join("only", "use", "this-last-piece.txt");
          fileWriter.write(oldPath, str, callbackSpy);
          expect(fs.renameSync).toHaveBeenCalledWith(
            oldPath,
            "/path/to/notes/this-last-piece.txt"
          );
          expect(fs.utimesSync).toHaveBeenCalled();
          expect(callbackSpy).toHaveBeenCalledWith(null, null);
        });

        it("should trim and normalize value", function() {
          fileWriter.write(oldPath, "  test.txt  ", callbackSpy);
          expect(fs.renameSync).toHaveBeenCalledWith(
            oldPath,
            "/path/to/notes/test.txt"
          );
          expect(fs.utimesSync).toHaveBeenCalled();
          expect(callbackSpy).toHaveBeenCalledWith(null, null);
        });
      });
    });
  });
});
