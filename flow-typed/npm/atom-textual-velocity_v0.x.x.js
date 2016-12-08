type ActionType = StartInitialScanActionType | ScannedFileActionType | InitialScanDoneActionType | DisposeActionType
type StartInitialScanActionType = {
  type: 'START_INITIAL_SCAN'
}
type ScannedFileActionType = {
  type: 'SCANNED_FILE',
  file: FileType
}
type InitialScanDoneActionType = {
  type: 'INITIAL_SCAN_DONE'
}
type DisposeActionType = {
  type: 'DISPOSE'
}

type InitialScanStoreType = {
  done: boolean,
  files: Array<FileType>
}
type UiStoreType = {
  listHeight: number
}
type StoreType = {
  initialScan: InitialScanStoreType,
  ui: UiStoreType
}

type FsStatsType =
  | (fs.Stats & {
    mtime: Date,
    birthtime?: Date
  })


type FileType = {
  filename: string,
  stats: FsStatsType
}
