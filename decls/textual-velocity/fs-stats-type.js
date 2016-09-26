declare type FsStatsType =
  | (fs.Stats & {
    mtime: Date,
    birthtime?: Date
  })
