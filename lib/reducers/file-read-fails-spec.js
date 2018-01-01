/* @flow */

import * as A from "../actions";
import fileReadFailsReducer from "./file-read-fails";

describe("reducers/file-read-fails", () => {
  let state: FileReadFails;

  beforeEach(() => {
    state = fileReadFailsReducer(undefined, A.readDirDone([]));
  });

  it("should have an empty list initially", () => {
    expect(state).toEqual({});
  });

  it("should keep track of failed reads", () => {
    // read working, nothing changes
    state = fileReadFailsReducer(
      state,
      A.fileRead({
        filename: "a",
        notePropName: "content",
        value: "foo"
      })
    );
    expect(state).toEqual({});

    // fail read on a untracked file
    state = fileReadFailsReducer(
      state,
      A.fileReadFailed({
        filename: "b.md",
        notePropName: "content"
      })
    );
    expect(state).toEqual({
      "b.md": ["content"]
    });

    // fail another notePropName
    state = fileReadFailsReducer(
      state,
      A.fileReadFailed({
        filename: "b.md",
        notePropName: "nvtags"
      })
    );
    expect(state).toEqual({
      "b.md": ["nvtags", "content"]
    });

    // subsequent fails for already tracked reads are just maintained
    state = fileReadFailsReducer(
      state,
      A.fileReadFailed({
        filename: "b.md",
        notePropName: "content"
      })
    );
    expect(state).toEqual({
      "b.md": ["content", "nvtags"]
    });
    // fail for a new file
    state = fileReadFailsReducer(
      state,
      A.fileReadFailed({
        filename: "c.md",
        notePropName: "content"
      })
    );
    expect(state).toEqual({
      "b.md": ["content", "nvtags"],
      "c.md": ["content"]
    });

    // don't change anything for a read unrelated to existing fails
    state = fileReadFailsReducer(
      state,
      A.fileRead({
        filename: "a",
        notePropName: "content",
        value: "new value"
      })
    );
    expect(state).toEqual({
      "b.md": ["content", "nvtags"],
      "c.md": ["content"]
    });

    // when reads works again
    state = fileReadFailsReducer(
      state,
      A.fileRead({
        filename: "b.md",
        notePropName: "content",
        value: "fixed!"
      })
    );
    expect(state).toEqual({
      "b.md": ["nvtags"],
      "c.md": ["content"]
    });

    // remove filename when last failed read is fixed
    state = fileReadFailsReducer(
      state,
      A.fileRead({
        filename: "b.md",
        notePropName: "nvtags",
        value: "also fixed"
      })
    );
    expect(state).toEqual({
      "c.md": ["content"]
    });
  });
});
