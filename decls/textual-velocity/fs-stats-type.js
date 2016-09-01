declare type FsStatsType =
  | (fs.Stats & {birthtime: Date | void})
  | {}
