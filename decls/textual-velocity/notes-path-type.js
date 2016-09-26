declare type NotesPathType = {
  root: string,
  fullPath (filename: string): string,
  filename (path: string): string
}
