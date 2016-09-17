declare type FileReaderType = {
  filePropName: string,
  skipRead?: (file: NotesFileType, contextInfo: {isNewFile?: boolean}) => boolean,
  read (path: string, callback: NodeCallbackType): void
}
