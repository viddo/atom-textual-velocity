/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../action-creators";
import Search from "../presentationals/search";

const mapStateToProps: MapStateToProps<State, *, *> = (state: State) => {
  return {
    focusOnEvents: !!state.editCellName,
    query: state.queryOriginal
  };
};

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onKeyPress: (event: KeyPressEvent) => {
      switch (event.keyCode) {
        case 13: // ENTER
          dispatch(A.openNote());
          break;
        case 27: // ESC
          dispatch(A.resetSearch());
          break;
        case 40: // DOWN
          event.preventDefault();
          dispatch(A.selectNext());
          break;
        case 38: // UP
          event.preventDefault();
          dispatch(A.selectPrev());
          break;
      }
    },
    onSearch: str => {
      dispatch(A.search(str));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
