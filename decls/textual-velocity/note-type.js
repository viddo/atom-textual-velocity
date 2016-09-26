declare type NoteType = {
  id: string,
  name: string,
  ext: string,
  ready: boolean,
  stats: FsStatsType,

  // known fields that will exist, eventually
  content?: string
}
