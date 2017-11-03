var fs = require("fs");
var Path = require("path");
var tempy = require("tempy");
var Service = require("../../lib/service");
var nvTags = require("../../lib/service-consumers/nv-tags");

var unsupErr = nvTags.getUnsupportedError();

// tests for platforms where nvtags are unavailable
describe("service-consumers/nv-tags", () => {
  it("should return a disposable object even if tags will not be loaded", () => {
    var service = new Service();
    spyOn(nvTags, "getUnsupportedError").andReturn("not supported");
    var disposable = nvTags.consumeService(service);
    expect(disposable.dispose).toEqual(jasmine.any(Function));
  });
});

if (unsupErr) {
  console.log("nv-tags-specs will not run, see logged error on next line:");
  console.warn(unsupErr);
} else {
  // tests for platforms where nvtags are available
  describe("service-consumers/nv-tags", () => {
    var disposable, service;

    beforeEach(() => {
      service = new Service(); // integration tested through main-spec.js and CI env
      spyOn(service, "registerColumns");
      spyOn(service, "registerFields");
      spyOn(service, "registerFileReaders");
      spyOn(service, "registerFileWriters");

      disposable = nvTags.consumeService(service);
      expect(service.registerColumns).toHaveBeenCalled();
      expect(service.registerFields).toHaveBeenCalled();
      expect(service.registerFileReaders).toHaveBeenCalled();
      expect(service.registerFileWriters).toHaveBeenCalled();
    });

    afterEach(() => {
      disposable.dispose();
    });

    describe("registered field", () => {
      var field;

      beforeEach(() => {
        field = service.registerFields.mostRecentCall.args[0];
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
      var column;

      beforeEach(() => {
        column = service.registerColumns.mostRecentCall.args[0];
      });

      describe(".cellContent", () => {
        it("should return the tags as a space separated string", () => {
          var note = { nvtags: ["beep", "boop"] };
          var cellContent = column.cellContent({ note: note });

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

    describe("registered file reader+writer", () => {
      var fileReader, fileWriter, path, callback;
      var fileStats = {};

      beforeEach(() => {
        fileReader = service.registerFileReaders.mostRecentCall.args[0];
        fileWriter = service.registerFileWriters.mostRecentCall.args[0];
        callback = jasmine.createSpy("callback");
      });

      it("should write/read tags to file of given path", () => {
        var readSpy = jasmine.createSpy("fileReader.read");
        var writeSpy = jasmine.createSpy("fileWriter.write");
        var tmpPath = tempy.file();
        fs.writeFileSync(tmpPath, "foo", { encoding: "utf8" });
        fileWriter.write(tmpPath, "beep boop boop beep", writeSpy);

        waitsFor(() => {
          return writeSpy.calls.length >= 1;
        });
        runs(() => {
          expect(writeSpy.mostRecentCall.args[0]).toBeFalsy();
          expect(writeSpy.mostRecentCall.args[1]).toBeFalsy();
          fileReader.read(tmpPath, fileStats, readSpy);
        });

        waitsFor(() => {
          return readSpy.calls.length >= 1;
        });
        runs(() => {
          expect(readSpy.mostRecentCall.args[0]).toBeFalsy();
          expect(readSpy.mostRecentCall.args[1]).toEqual(["beep", "boop"]);
        });
      });

      it("should return null for a read file that have no xattrs set", () => {
        path = Path.join(__dirname, "..", "fixtures", "standard", "empty.md");
        fileReader.read(path, fileStats, callback);
        waitsFor(() => {
          return callback.calls.length >= 1;
        });
        runs(() => {
          expect(callback.mostRecentCall.args[0]).toBeFalsy();
          expect(callback.mostRecentCall.args[1]).toEqual(null);
        });
      });

      it("should return error if read file does not exist", () => {
        fileReader.read("nonexisting", fileStats, callback);
        waitsFor(() => {
          return callback.calls.length >= 1;
        });
        runs(() => {
          expect(callback.mostRecentCall.args[0]).toBeDefined();
          expect(callback.mostRecentCall.args[0].code).toEqual("ENOENT");
          expect(callback.mostRecentCall.args[1]).toBeFalsy();
        });
      });
    });
  });
}
