declare type ViewCtrlType = {
  abortEditCellS: Bacon.Stream,
  activePathS: Bacon.Stream,
  clickedCellS: Bacon.Stream,
  dblClickedCellS: Bacon.Stream,
  keyDownS: Bacon.Stream,
  keyEnterS: Bacon.Stream,
  keyEscS: Bacon.Stream,
  keyUpS: Bacon.Stream,
  listHeightS: Bacon.Stream,
  rowHeightS: Bacon.Stream,
  saveEditedCellContentS: Bacon.Stream,
  scrollTopS: Bacon.Stream,
  sessionStartS: Bacon.Stream,
  sortDirectionS: Bacon.Stream,
  sortFieldS: Bacon.Stream,
  textInputS: Bacon.Stream,
  dispose (): void
}
