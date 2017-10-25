"use babel";

import { defaultConfig } from "../lib/config";
import Path from "path";
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
      expect(notesFileFilter.isAccepted(Path.join(__dirname, "file.txt"))).toBe(
        true
      );
      expect(notesFileFilter.isAccepted(Path.join(__dirname, "file.md"))).toBe(
        true
      );
      expect(notesFileFilter.isAccepted(Path.join(__dirname, "file.js"))).toBe(
        true
      );
      expect(
        notesFileFilter.isAccepted(Path.join(__dirname, "file.json"))
      ).toBe(true);
      expect(
        notesFileFilter.isAccepted(Path.join(__dirname, "file.bash"))
      ).toBe(true);
    });

    it("returns false for any non-text file", function() {
      expect(notesFileFilter.isAccepted(Path.join(__dirname, "file.exe"))).toBe(
        false
      );
      expect(notesFileFilter.isAccepted(Path.join(__dirname, "file.jpg"))).toBe(
        false
      );
      expect(notesFileFilter.isAccepted(Path.join(__dirname, "file.zip"))).toBe(
        false
      );
      expect(notesFileFilter.isAccepted(Path.join(__dirname, "file.pdf"))).toBe(
        false
      );
    });

    it("returns false for any excluded file", function() {
      expect(
        notesFileFilter.isAccepted(Path.join(__dirname, ".git/index"))
      ).toBe(false);
      expect(
        notesFileFilter.isAccepted(Path.join(__dirname, ".DS_Store"))
      ).toBe(false);
    });

    it("returns false for nv/nvalt settings file", function() {
      expect(
        notesFileFilter.isAccepted(Path.join(__dirname, "Notes & Settings"))
      ).toBe(false);
    });
  });
});
