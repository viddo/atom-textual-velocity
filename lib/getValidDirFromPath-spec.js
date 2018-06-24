/* @flow */

import getValidDirFromPath from "./getValidDirFromPath";
import fs from "fs-plus";

const assertCommons = dir => {
  expect(dir).toEqual(jasmine.any(String));
  expect(dir).not.toEqual("");
};

describe("getValidDirFromPath", function() {
  let dir;

  beforeEach(function() {
    spyOn(fs, "existsSync").andReturn(true);
    spyOn(fs, "mkdirSync");
  });

  it("should return default path if no path is set", function() {
    dir = getValidDirFromPath("");
    assertCommons(dir);
    expect(dir).toMatch(/.+notes$/);

    dir = getValidDirFromPath("  ");
    assertCommons(dir);
    expect(dir).toMatch(/.+notes$/);
    expect(fs.existsSync).toHaveBeenCalledWith(jasmine.any(String));
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it("should expand any relative path dir to absoute dir in user's home dir", function() {
    const dir = getValidDirFromPath("  custom-path/  ");
    assertCommons(dir);
    expect(dir).toMatch(/.+custom-path$/);
    expect(dir).not.toEqual("custom-path");
  });

  it("should return absolute path as is", function() {
    const dir = getValidDirFromPath("  /Users/alice/notes/  ");
    assertCommons(dir);
    expect(dir).toEqual("/Users/alice/notes");
  });

  it("should expand home shortcut to absolute path", function() {
    const dir = getValidDirFromPath("  ~/home-notes/  ");
    assertCommons(dir);
    expect(dir).toMatch(/.+home-notes$/);
    expect(dir).not.toEqual("~/home-notes");
  });

  it("should create directory if it does not exist", function() {
    const dir = "/tmp/notes";
    fs.existsSync.andReturn(false);
    getValidDirFromPath(dir);
    expect(fs.existsSync).toHaveBeenCalledWith(jasmine.any(String));
    expect(fs.mkdirSync).toHaveBeenCalledWith(dir, 0o755);
  });
});
