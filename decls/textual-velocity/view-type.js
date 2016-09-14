import Bacon from 'fs'

declare type ViewType = {
  abortEditCellStream: Bacon.Stream,
  clickedCellStream: Bacon.Stream,
  dblClickedCellStream: Bacon.Stream,
  keyDownStream: Bacon.Stream,
  listHeightStream: Bacon.Stream,
  saveEditedCellContentStream: Bacon.Stream,
  scrollTopStream: Bacon.Stream,
  sortDirectionStream: Bacon.Stream,
  sortFieldStream: Bacon.Stream,
  textInputStream: Bacon.Stream,
  renderLoading (listHeight: number): void,
  renderResults (params: ResultsViewParamsType): void,
  dispose (): void
}
