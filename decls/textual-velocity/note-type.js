declare type NoteType = {
  id: string,
  name: string,
  ext: string,

  // known fields that will exist, eventually
  content?: string,
  stats?: FsStatsType
}
