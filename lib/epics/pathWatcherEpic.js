/* @flow */

import { watchPath } from "atom";
import fs from "fs";
import path from "path";
import { bindNodeCallback, empty, from, fromEventPattern, of } from "rxjs";
import { catchError, filter, mergeMap, map } from "rxjs/operators";
import * as A from "../actions";
import NotesFileFilter from "../NotesFileFilter";
import takeUntilDispose from "../takeUntilDispose";
import { showWarningNotification } from "../showWarningNotification";

import type { Action } from "../actions";
import type { State } from "../../flow-types/State";

export default function pathWatcherEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>,
  { notesFileFilter }: { notesFileFilter: typeof NotesFileFilter }
) {
  const { dir } = state$.value;
  const [addHandler, removeHandler] = newEventPatternHandlers(dir);

  return fromEventPattern(addHandler, removeHandler).pipe(
    mergeMap(event => from(event)),
    filter(event => notesFileFilter.isAccepted(event.path)),
    mergeMap(event => {
      switch (event.action) {
        case "deleted":
          // special case: no need to stat, just pass the filename as is
          return of(A.fileDeleted(getFilename(dir, event.path)));

        case "renamed":
          // special case: no need to stat, pass rename action through directly
          return of(
            A.fileRenamed({
              filename: getFilename(dir, event.path),
              oldFilename: getFilename(dir, event.oldPath)
            })
          );

        default: {
          const statFileAsObservable = bindNodeCallback(fs.stat);
          return statFileAsObservable(event.path).pipe(
            map(stats => {
              if (stats.isFile()) {
                return newFileAction(dir, event, stats);
              }
            }),
            catchError(error => {
              console.error(error);
              return empty();
            })
          );
        }
      }
    }),
    filter(Boolean),
    takeUntilDispose(action$)
  );
}

function newEventPatternHandlers(dir: string) {
  let watcher;
  let onWatcherDidError;

  const addHandler = handler => {
    // necessary to comply with fromEventPattern's params signature,
    // that doesnt expect an async fn
    const innerHandler = async () => {
      const options = {}; // there are no options, for now just a placeholder for the future
      watcher = await watchPath(dir, options, handler);

      onWatcherDidError = watcher.onDidError(error => {
        showWarningNotification(`Watched notes path ${dir} failed`, error);
      });

      if (global.setProcessInTesting) {
        global.setProcessInTesting(process, { watcher });
      }
    };
    innerHandler();
  };

  const removeHandler = () => {
    const innerHandler = async () => {
      if (watcher) {
        await watcher.dispose();
      }
      if (onWatcherDidError) {
        onWatcherDidError.dispose();
      }
    };
    innerHandler();
  };
  return [addHandler, removeHandler];
}

function newFileAction(
  dir: string,
  event: atom$PathWatcherEvent,
  stats: fs.Stats
) {
  switch (event.action) {
    case "created":
      return A.fileAdded({
        filename: getFilename(dir, event.path),
        stats
      });

    case "modified":
      return A.fileChanged({
        filename: getFilename(dir, event.path),
        stats
      });
  }
}

function getFilename(dir, filePath) {
  return filePath.replace(dir + path.sep, "");
}
