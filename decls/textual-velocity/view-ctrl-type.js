import Bacon from 'fs'

declare type ViewCtrlType = {
  activePathStream: Bacon.Stream,
  clickedRowStream: Bacon.Stream,
  keyDownStream: Bacon.Stream,
  keyEnterStream: Bacon.Stream,
  keyEscStream: Bacon.Stream,
  keyUpStream: Bacon.Stream,
  listHeightStream: Bacon.Stream,
  rowHeightStream: Bacon.Stream,
  scrollTopStream: Bacon.Stream,
  sessionStartStream: Bacon.Stream,
  sortDirectionStream: Bacon.Stream,
  sortFieldStream: Bacon.Stream,
  textInputStream: Bacon.Stream,
  deactivate: () => void
}
