/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../actions";
import TableColumn from "../presentationals/table-column";

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
