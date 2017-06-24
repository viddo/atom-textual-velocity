/* @flow */

import getValidDirFromPath from "../lib/get-valid-dir-from-path";

const assertCommons = dir => {
  expect(dir).toEqual(jasmine.any(String));
  expect(dir).not.toEqual("");
};

describe("get-valid-dir-from-path", function() {
  let dir;

  it("should return default path if no path is set", function() {
    dir = getValidDirFromPath("");
    assertCommons(dir);
    expect(dir).toMatch(/.+notes$/);

    dir = getValidDirFromPath("  ");
    assertCommons(dir);
    expect(dir).toMatch(/.+notes$/);
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
});
