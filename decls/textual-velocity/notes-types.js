declare type NotesFileOptionsType = {
  stats: FsStatsType | null,
  content: string | null
}

declare type NotesFileType = {
  id: string,
  relPath: string,
  path: string,
  name: string,
  ext: string,
  createdTime: number | void,
  lastUpdatedTime: number | void,
  stats: FsStatsType,
  content: string | null
}

declare type NotesPathType = {
  root: string,
  fullPath: (relPath: string) => string,
  newFile: (relPath: string, options?: NotesFileOptionsType) => NotesFileType
}

declare type NotesPathFilterType = {
  isAccepted: (path: string) => boolean
}
