import fs from 'fs'
import Bacon from 'fs'

declare type InteractorType = {
  filesProp: Bacon.Property,
  forcedScrollTopProp: Bacon.Property,
  listHeightProp: Bacon.Property,
  loadingStream: Bacon.Stream,
  notesPathStream: Bacon.Stream,
  openFileStream: Bacon.Stream,
  paginationProp: Bacon.Property,
  rowHeightProp: Bacon.Property,
  selectedIndexProp: Bacon.Property,
  sifterResultProp: Bacon.Property
}
