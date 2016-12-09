type ActionType = StartInitialScanActionType | ScannedFileActionType | InitialScanDoneActionType | DisposeActionType
type StartInitialScanActionType = {
  type: 'START_INITIAL_SCAN'
}
type ScannedFileActionType = {
  type: 'SCANNED_FILE',
  rawFile: RawFileType
}
type InitialScanDoneActionType = {
  type: 'INITIAL_SCAN_DONE'
}
type DisposeActionType = {
  type: 'DISPOSE'
}

type InitialScanStateType = {
  done: boolean,
  rawFiles: Array<RawFileType>
}
type NotesStateType = any
type UiStateType = {
  listHeight: number
}
type StateType = {
  initialScan: InitialScanStateType,
  notes: NotesStateType,
  ui: UiStateType
}

type FsStatsType =
  | (fs.Stats & {
    mtime: Date,
    birthtime?: Date
  })


type RawFileType = {
  filename: string,
  stats: FsStatsType
}

type NoteFieldType = {
  notePropName: string,
  value?: (note: any, filename: string) => any
}

type NotesFieldsType = {
  add (field: NoteFieldType): void,
  allFields (): Array<NoteFieldType>
}
