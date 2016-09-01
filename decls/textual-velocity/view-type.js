import Bacon from 'fs'

declare type ViewType = {
  clickedRowStream: Bacon.Stream,
  keyDownStream: Bacon.Stream,
  listHeightStream: Bacon.Stream,
  scrollTopStream: Bacon.Stream,
  sortDirectionStream: Bacon.Stream,
  sortFieldStream: Bacon.Stream,
  textInputStream: Bacon.Stream,
  renderLoading: (listHeight: number) => void,
  renderResults: (params: ResultsViewParamsType) => void,
  dispose: () => void
}
