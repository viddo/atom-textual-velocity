/* @flow */

import { connect } from "react-redux";
import * as A from "../../actions";
import TableColumn from "../presentationals/TableColumn";

import type { Dispatch } from "redux";
import type { Action } from "../../actions";
import type { State } from "../../../flow-types/State";

const mapStateToProps = (state: State) => {
  const sort = state.sifterResult.options.sort;
  if (sort && sort[0]) {
    return {
      sortDirection: sort[0].direction,
      sortField: sort[0].field,
    };
  }

  return {
    sortDirection: "desc",
    sortField: "$score",
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    onClickColumn: (sortField: string) => {
      dispatch(A.changeSort(sortField));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableColumn);
