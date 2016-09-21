declare type NotesPathType = {
  root: string,
  fullPath (relPath: string): string,
  relPath (path: string): string
}
