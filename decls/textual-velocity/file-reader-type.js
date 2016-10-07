declare type FileReaderType = {
  notePropName: string,
  read (path: string, fileStats: FsStatsType, callback: NodeCallbackType): void
}
