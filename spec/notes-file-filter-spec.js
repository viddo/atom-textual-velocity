/* @flow */

import Path from "path";
import { defaultConfig } from "../lib/config";
import NotesFileFilter from "../lib/notes-file-filter";
import { CACHE_FILENAME } from "../lib/notes-cache";

describe("notes-file-filter", () => {
  let notesFileFilter;
  let dir: string;

  beforeEach(function() {
    atom.config.set(
      "textual-velocity.ignoredNames",
      defaultConfig.ignoredNames.default
    );
    atom.config.set(
      "textual-velocity.excludeVcsIgnoredPaths",
      defaultConfig.excludeVcsIgnoredPaths.default
    );
    dir = __dirname;
    notesFileFilter = new NotesFileFilter(dir, {
      exclusions: atom.config.get("textual-velocity.ignoredNames"),
      excludeVcsIgnores: atom.config.get(
        "textual-velocity.excludeVcsIgnoredPaths"
      )
    });
  });

  describe(".isAccepted", function() {
    it("returns true for any text file", function() {
      expect(notesFileFilter.isAccepted("file.txt")).toBe(true);
      expect(notesFileFilter.isAccepted("file.md")).toBe(true);
      expect(notesFileFilter.isAccepted("file.js")).toBe(true);
      expect(notesFileFilter.isAccepted("file.json")).toBe(true);
      expect(notesFileFilter.isAccepted("file.bash")).toBe(true);
    });

    it("returns true for any unknown file", function() {
      expect(notesFileFilter.isAccepted("file or dir")).toBe(true);
    });

    it("returns true for an absolute path within the given dir", function() {
      let path = Path.join(dir, "file.txt");
      expect(notesFileFilter.isAccepted(path)).toBe(true);
      path = Path.join(dir, "file.md");
      expect(notesFileFilter.isAccepted(path)).toBe(true);
    });

    it("returns false for any non-text file", function() {
      expect(notesFileFilter.isAccepted("file.exe")).toBe(false);
      expect(notesFileFilter.isAccepted("file.jpg")).toBe(false);
      expect(notesFileFilter.isAccepted("file.zip")).toBe(false);
      expect(notesFileFilter.isAccepted("file.pdf")).toBe(false);
    });

    it("returns false for any excluded file", function() {
      expect(notesFileFilter.isAccepted(".git/index")).toBe(false);
      expect(notesFileFilter.isAccepted(".DS_Store")).toBe(false);
    });

    it("returns false for any absolute path outside of root", function() {
      let path = Path.join("..", "file.txt");
      expect(notesFileFilter.isAccepted(path)).toBe(false);
    });

    it("returns false for any files in a sub directory", function() {
      let path = Path.join(dir, "some-path", "file.txt");
      expect(notesFileFilter.isAccepted(path)).toBe(false);
      path = Path.join("some-path", "file.txt");
      expect(notesFileFilter.isAccepted(path)).toBe(false);
    });

    it("returns false for nv/nvalt settings file", function() {
      expect(notesFileFilter.isAccepted("Notes & Settings")).toBe(false);
    });

    it("returns false for cache file", function() {
      expect(notesFileFilter.isAccepted(CACHE_FILENAME)).toBe(false);
    });
  });
});
