import fs from 'fs'
import Bacon from 'fs'

declare type InteractorType = {
  editCellNameP: Bacon.Property,
  filesP: Bacon.Property,
  forcedScrollTopP: Bacon.Property,
  listHeightP: Bacon.Property,
  loadingS: Bacon.Stream,
  notesPathS: Bacon.Stream,
  openFileS: Bacon.Stream,
  paginationP: Bacon.Property,
  rowHeightP: Bacon.Property,
  saveEditedCellContentS: Bacon.Stream,
  selectedIndexP: Bacon.Property,
  sifterResultP: Bacon.Property
}
