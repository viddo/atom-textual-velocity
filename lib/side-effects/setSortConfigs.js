/* @flow */

import type { SortDirection } from "../../flow-types/SortDirection";
import type { SortSearchOptions } from "sifter";

const DEFAULT_SORT_DIRECTION = "desc";

const transactSet = (sortField: string, sortDirection: SortDirection) => {
  atom.config.transact(() => {
    atom.config.set("textual-velocity.sortField", sortField);
    atom.config.set("textual-velocity.sortDirection", sortDirection);
  });
};

// Set sort configs will handle the expected state transition when a column is clicked
export default function setSortConfigs(
  sortField: string,
  lastSort?: SortSearchOptions
) {
  if (!lastSort) {
    // Either prev sort was using default $score sort, or there is no result to use
    // In either case, update with the new sort field
    transactSet(sortField, DEFAULT_SORT_DIRECTION);
    return;
  }

  if (sortField === lastSort.field) {
    switch (lastSort.direction) {
      case "desc":
        transactSet(sortField, "asc");
        return;
      case "asc":
        transactSet("$score", "desc");
        return;
      default:
        transactSet(sortField, DEFAULT_SORT_DIRECTION);
        return;
    }
  } else {
    // Sort field changed, update with last sort direction
    transactSet(sortField, lastSort.direction || DEFAULT_SORT_DIRECTION);
  }
}
