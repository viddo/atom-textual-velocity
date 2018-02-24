/* @flow */

import fs from "fs";
import NVtags from "./NVtags";
var Path = require("path");
var tempy = require("tempy");

if (NVtags.isSupported()) {
  describe("NVtags", () => {
    var path, readCallback, writeCallback;

    beforeEach(() => {
      readCallback = jasmine.createSpy("readCallback");
      writeCallback = jasmine.createSpy("writeCallback");
    });

    it("should write/read tags to file of given path", () => {
      const tmpPath = tempy.file();
      fs.writeFileSync(tmpPath, "foo", { encoding: "utf8" });
      NVtags.write(tmpPath, "beep   boop   boop beep", writeCallback);

      waitsFor(() => {
        return writeCallback.calls.length >= 1;
      });
      runs(() => {
        expect(writeCallback.mostRecentCall.args[0]).toBeFalsy();
        expect(writeCallback.mostRecentCall.args[1]).toEqual(["beep", "boop"]);
        NVtags.read(tmpPath, readCallback);
      });

      waitsFor(() => {
        return readCallback.calls.length >= 1;
      });
      runs(() => {
        expect(readCallback.mostRecentCall.args[0]).toBeFalsy();
        expect(readCallback.mostRecentCall.args[1]).toEqual(["beep", "boop"]);
      });
    });

    it("should return null for a read file that have no xattrs set", () => {
      path = Path.join(__dirname, "fixtures", "standard", "empty.md");
      NVtags.read(path, readCallback);
      waitsFor(() => {
        return readCallback.calls.length >= 1;
      });
      runs(() => {
        expect(readCallback.mostRecentCall.args[0]).toBeFalsy();
        expect(readCallback.mostRecentCall.args[1]).toEqual(null);
      });
    });

    it("should return error if read file does not exist", () => {
      NVtags.read("nonexisting", readCallback);
      waitsFor(() => {
        return readCallback.calls.length >= 1;
      });
      runs(() => {
        expect(readCallback.mostRecentCall.args[0]).toBeDefined();
        expect(readCallback.mostRecentCall.args[0].code).toEqual("ENOENT");
        expect(readCallback.mostRecentCall.args[1]).toBeFalsy();
      });
    });
  });
}
