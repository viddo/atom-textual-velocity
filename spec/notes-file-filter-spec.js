"use babel";

import { defaultConfig } from "../lib/config";
import NotesFileFilter from "../lib/notes-file-filter";

describe("notes-file-filter", () => {
  let notesFileFilter;

  beforeEach(function() {
    atom.config.set(
      "textual-velocity.ignoredNames",
      defaultConfig.ignoredNames.default
    );
    atom.config.set(
      "textual-velocity.excludeVcsIgnoredPaths",
      defaultConfig.excludeVcsIgnoredPaths.default
    );
    notesFileFilter = new NotesFileFilter(__dirname, {
      exclusions: atom.config.get("textual-velocity.ignoredNames"),
      excludeVcsIgnores: atom.config.get(
        "textual-velocity.excludeVcsIgnoredPaths"
      )
    });
  });

  describe(".isAccepted", function() {
    it("returns true for any text file", function() {
      expect(notesFileFilter.isAccepted({ filename: "file.txt" })).toBe(true);
      expect(notesFileFilter.isAccepted({ filename: "file.md" })).toBe(true);
      expect(notesFileFilter.isAccepted({ filename: "file.js" })).toBe(true);
      expect(notesFileFilter.isAccepted({ filename: "file.json" })).toBe(true);
      expect(notesFileFilter.isAccepted({ filename: "file.bash" })).toBe(true);
    });

    it("returns false for any non-text file", function() {
      expect(notesFileFilter.isAccepted({ filename: "file.exe" })).toBe(false);
      expect(notesFileFilter.isAccepted({ filename: "file.jpg" })).toBe(false);
      expect(notesFileFilter.isAccepted({ filename: "file.zip" })).toBe(false);
      expect(notesFileFilter.isAccepted({ filename: "file.pdf" })).toBe(false);
    });

    it("returns false for any excluded file", function() {
      expect(notesFileFilter.isAccepted({ filename: ".git/index" })).toBe(
        false
      );
      expect(notesFileFilter.isAccepted({ filename: ".DS_Store" })).toBe(false);
    });

    it("returns false for nv/nvalt settings file", function() {
      expect(notesFileFilter.isAccepted({ filename: "Notes & Settings" })).toBe(
        false
      );
    });
  });
});
