/* @flow */

import * as A from "../action-creators";
import { connect } from "react-redux";
import { TableColumn } from "./table-column";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";

const mapStateToProps: MapStateToProps<State, *, *> = (state: State) => {
  const sort = state.sifterResult.options.sort[0];
  return {
    sortDirection: sort.direction,
    sortField: sort.field
  };
};

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onChangeSortDirection: direction => {
      dispatch(A.changeSortDirection(direction));
    },
    onSortByField: sortField => {
      dispatch(A.changeSortField(sortField));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableColumn);
