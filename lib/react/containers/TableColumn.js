/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../actions";
import TableColumn from "../presentationals/TableColumn";
import type { Action } from "../../actions";
import type { State } from "../../flow-types/State";

const mapStateToProps: MapStateToProps<State, *, *> = (state: State) => {
  const sort = state.sifterResult.options.sort;
  if (sort && sort[0]) {
    return {
      sortDirection: sort[0].direction || "desc",
      sortField: sort[0].field
    };
  } else {
    return {
      sortDirection: "desc",
      sortField: "summary"
    };
  }
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TableColumn);
