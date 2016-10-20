declare type PathWatcherType = {
  initialScanDoneP: Bacon.Property,
  newFilenameS: Bacon.Stream,
  sifterP: Bacon.Property,
  dispose: Function
}
