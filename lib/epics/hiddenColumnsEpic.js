/* @flow */

import { Observable } from "rxjs";
import Disposables from "../Disposables";
import observeConfig from "../atom-rxjs/observeConfig";
import { name } from "../Columns";
import * as A from "../actions";
import type { Action } from "../actions";
import type { State } from "../flow-types/State";
import type { IColumns } from "../flow-types/IColumns";

let contextMenuDisposable;

export default function hiddenColumnsEpic(
  action$: Observable<Action>,
  store: Store<State, Action>,
  { columns }: { columns: IColumns }
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
            label: `${hiddenColumns.includes(columnName) ? "   " : "✓"} ${
              column.title
            }`,
            command: `textual-velocity:toggle-${columnName}-column`
          };
        })
      });

      return A.changeHiddenColumns(hiddenColumns);
    })
    .takeUntil(
      action$
        .filter(({ type }) => type === A.DISPOSE)
        .do(() => {
          if (contextMenuDisposable) {
            contextMenuDisposable.dispose();
          }
          contextMenuDisposable = null;
          disposableCommands.dispose();
        })
        .take(1)
    );
}
