/* @flow */

import { finalize, map } from "rxjs/operators";
import Disposables from "../Disposables";
import observeConfig from "../atom-rxjs/observeConfig";
import columns, { name } from "../Columns";
import takeUntilDispose from "../takeUntilDispose";
import * as A from "../actions";

import type { Action } from "../actions";

let contextMenu;
const disposeContextMenu = () => {
  if (contextMenu) {
    contextMenu.dispose();
  }
  contextMenu = null;
};

export default function hiddenColumnsEpic(action$: rxjs$Observable<Action>) {
  const disposableCommands = new Disposables(
    ...columns.map((column) => {
      const columnName = name(column);
      return atom.commands.add(
        "atom-workspace",
        `textual-velocity:toggle-${columnName}-column`,
        () => {
          const hiddenColumns = atom.config.get(
            "textual-velocity.hiddenColumns"
          );
          atom.config.set(
            "textual-velocity.hiddenColumns",
            hiddenColumns.includes(columnName)
              ? hiddenColumns.filter((name) => name !== columnName)
              : [...hiddenColumns, columnName]
          );
        }
      );
    })
  );

  return observeConfig("textual-velocity.hiddenColumns").pipe(
    map((hiddenColumns) => {
      disposeContextMenu();
      contextMenu = atom.contextMenu.add({
        ".textual-velocity .header": columns.map((column) => {
          const columnName = name(column);
          return {
            label: `${hiddenColumns.includes(columnName) ? "   " : "✓"} ${
              column.title
            }`,
            command: `textual-velocity:toggle-${columnName}-column`,
          };
        }),
      });

      return A.changeHiddenColumns(hiddenColumns);
    }),
    takeUntilDispose(action$),
    finalize(() => {
      disposeContextMenu();
      disposableCommands.dispose();
    })
  );
}
