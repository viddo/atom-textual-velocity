/* @flow */

export type LoadingState =
  | ReadDirLoadingState
  | ReadingFilesLoadingState
  | DoneLoadingState;

type ReadDirLoadingState = {
  status: "readDir",
  filesCount: number
};

type ReadingFilesLoadingState = {
  status: "readingFiles",
  readyCount: number,
  totalCount: number
};

type DoneLoadingState = {
  status: "done"
};
