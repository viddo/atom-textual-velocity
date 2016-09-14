import Bacon from 'fs'

declare type ViewCtrlType = {
  abortEditCellStream: Bacon.Stream,
  activePathStream: Bacon.Stream,
  clickedCellStream: Bacon.Stream,
  dblClickedCellStream: Bacon.Stream,
  keyDownStream: Bacon.Stream,
  keyEnterStream: Bacon.Stream,
  keyEscStream: Bacon.Stream,
  keyUpStream: Bacon.Stream,
  listHeightStream: Bacon.Stream,
  rowHeightStream: Bacon.Stream,
  saveEditedCellContentStream: Bacon.Stream,
  scrollTopStream: Bacon.Stream,
  sessionStartStream: Bacon.Stream,
  sortDirectionStream: Bacon.Stream,
  sortFieldStream: Bacon.Stream,
  textInputStream: Bacon.Stream,
  deactivate (): void
}
