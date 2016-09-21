declare type FileReaderType = {
  filePropName: string,
  read (path: string, callback: NodeCallbackType): void,
  skipIfHasStatsForNewFile?: boolean
}
