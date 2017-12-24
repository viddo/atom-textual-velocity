/* @flow */

import * as A from "../action-creators";
import { connect } from "react-redux";
import Search from "./search";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";

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
    onKeyPress: event => {
      dispatch(A.keyPress(event));
    },
    onSearch: str => {
      dispatch(A.search(str));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
