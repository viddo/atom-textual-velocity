/* @flow */

import { Observable } from "rxjs";
import Disposables from "../disposables";
import { observeConfig } from "../atom-rxjs-observables";
import { name } from "../columns";
import * as A from "../action-creators";

export default function makeHiddenColumnsEpic(columns: Columns) {
  let contextMenuDisposable;

  return function hiddenColumnsEpic(
    action$: Observable<Action>,
    store: Store<State, Action>
  ) {
    const disposableCommands = new Disposables(
      ...columns.map(column => {
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
                ? hiddenColumns.filter(name => name !== columnName)
                : [...hiddenColumns, columnName]
            );
          }
        );
      })
    );

    return observeConfig("textual-velocity.hiddenColumns")
      .map(hiddenColumns => {
        if (contextMenuDisposable) {
          contextMenuDisposable.dispose();
        }

        contextMenuDisposable = atom.contextMenu.add({
          ".textual-velocity .header": columns.map(column => {
            const columnName = name(column);
            return {
              label: `${hiddenColumns.includes(columnName)
                ? "   "
                : "✓"} ${column.title}`,
              command: `textual-velocity:toggle-${columnName}-column`
            };
          })
        });

        return A.changeHiddenColumns(hiddenColumns);
      })
      .takeUntil(
        action$.filter(action => action.type === A.DISPOSE).do(() => {
          if (contextMenuDisposable) {
            contextMenuDisposable.dispose();
          }
          contextMenuDisposable = null;
          disposableCommands.dispose();
        })
      );
  };
}
