declare type FileReaderType = {
  notePropName: string,
  read (path: string, callback: NodeCallbackType): void
}
