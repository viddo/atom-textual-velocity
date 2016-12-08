type ActionType = {type: string}

type FsStatsType =
  | (fs.Stats & {
    mtime: Date,
    birthtime?: Date
  })


type FileType = {
  filename: string,
  stats: FsStatsType
}

type StoreType = {
  initialScan: {
    done: boolean,
    files: Array<FileType>
  },
  ui: {
    listHeight: number
  }
}
