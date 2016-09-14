import Bacon from 'fs'

declare type PathWatcherType = {
  initialScanDoneProp: Bacon.Property,
  filesProp: Bacon.Property,
  dispose: Function
}

declare type PathWatcherFactoryType = {
  watch (path: NotesPathType, filter: NotesPathFilterType): PathWatcherType
}
