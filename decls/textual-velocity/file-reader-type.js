declare type FileReaderType = {
  propName: string,
  skipRead?: (file: NotesFileType, contextInfo: {isNewFile?: boolean}) => boolean,
  read (path: string, callback: NodeCallbackType): void
}
