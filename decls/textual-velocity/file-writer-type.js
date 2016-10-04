declare type FileWriterType = {
  editCellName: string,
  write (path: string, str: string, callback: NodeCallbackType): void
}
