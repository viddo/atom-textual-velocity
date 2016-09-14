declare type NotesPathType = {
  root: string,
  fullPath (relPath: string): string,
  newFile (relPath: string, options?: NotesFileOptionsType): NotesFileType
}
