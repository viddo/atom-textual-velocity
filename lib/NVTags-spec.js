var fs = require("fs");
var Path = require("path");
var tempy = require("tempy");
var NVTags = require("./NVTags");
var Columns = require("./Columns").default;
var FileReaders = require("./FileReaders").default;
var FileWriters = require("./FileWriters").default;
var NoteFields = require("./NoteFields").default;

var unsupErr = NVTags.getUnsupportedError();

// tests for platforms where nvtags are unavailable
describe("NVTags", () => {
  it("should return a disposable object even if tags will not be loaded", () => {
    spyOn(NVTags, "getUnsupportedError").andReturn("not supported");
    var disposable = NVTags.register();
    expect(disposable.dispose).toEqual(jasmine.any(Function));
  });
});

if (unsupErr) {
  console.log("NVTags-specs will not run, see logged error on next line:");
  console.warn(unsupErr);
} else {
  // tests for platforms where nvtags are available
  describe("NVTags", () => {
    var disposable, columns, fileReaders, fileWriters, noteFields;

    beforeEach(() => {
      columns = new Columns();
      fileReaders = new FileReaders();
      fileWriters = new FileWriters();
      noteFields = new NoteFields();
      spyOn(columns, "add");
      spyOn(fileReaders, "add");
      spyOn(fileWriters, "add");
      spyOn(noteFields, "add");

      disposable = NVTags.register(
        columns,
        fileReaders,
        fileWriters,
        noteFields
      );
      expect(columns.add).toHaveBeenCalled();
      expect(fileReaders.add).toHaveBeenCalled();
      expect(fileWriters.add).toHaveBeenCalled();
      expect(noteFields.add).toHaveBeenCalled();
    });

    afterEach(() => {
      disposable.dispose();
    });

    describe("registered field", () => {
      var field;

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
      var column;

      beforeEach(() => {
        column = columns.add.mostRecentCall.args[0];
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
        fileReader = fileReaders.add.mostRecentCall.args[0];
        fileWriter = fileWriters.add.mostRecentCall.args[0];
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
        path = Path.join(__dirname, "fixtures", "standard", "empty.md");
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
