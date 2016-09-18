import Bacon from 'fs'

declare type ViewType = {
  abortEditCellS: Bacon.Stream,
  clickedCellS: Bacon.Stream,
  dblClickedCellS: Bacon.Stream,
  keyDownS: Bacon.Stream,
  listHeightS: Bacon.Stream,
  saveEditedCellContentS: Bacon.Stream,
  scrollTopS: Bacon.Stream,
  sortDirectionS: Bacon.Stream,
  sortFieldS: Bacon.Stream,
  textInputS: Bacon.Stream,
  renderLoading (listHeight: number): void,
  renderResults (params: ResultsViewParamsType): void,
  dispose (): void
}
