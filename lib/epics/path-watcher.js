/* @flow */

import { watchPath } from "atom";
import fs from "fs";
import Path from "path";
import { Observable } from "rxjs";
import * as A from "../action-creators";
import * as C from "../action-constants";

export default function pathWatcherEpic(
  action$: Observable<Action>,
  store: Store<State, Action>,
  { notesFileFilter }: { notesFileFilter: NotesFileFilter }
) {
  const dir = store.getState().dir;
  const handlers = newEventPatternHandlers(dir);

  return Observable.fromEventPattern
    .apply(Observable, handlers)
    .mergeMap(events => Observable.from(events))
    .filter(event => notesFileFilter.isAccepted(event.path))
    .mergeMap(event => {
      switch (event.action) {
        case "deleted":
          // special case: no need to stat, just pass the filename as is
          return Observable.of(A.fileDeleted(getFilename(dir, event.path)));

        case "renamed":
          // special case: no need to stat, pass rename action through directly
          return Observable.of(
            A.fileRenamed({
              filename: getFilename(dir, event.path),
              oldFilename: getFilename(dir, event.oldPath)
            })
          );

        default:
          const statAsObservable = Observable.bindNodeCallback(fs.stat);
          return statAsObservable(event.path)
            .map(stats => {
              if (stats.isFile()) {
                return newFileAction(dir, event, stats);
              }
            })
            .catch(err => {
              console.error(err);
              return Observable.empty();
            });
      }
    })
    .filter(action => !!action)
    .takeUntil(action$.filter(action => action.type === C.DISPOSE).take(1));
}

function newEventPatternHandlers(dir: string) {
  let watcher;
  let unsubscribeOnDidError;

  const addHandler = handler => {
    // necessary to comply with fromEventPattern's params signature,
    // that doesnt expect an async fn
    const innerHandler = async () => {
      const options = {}; // there are no options, for now just a placeholder for the future
      watcher = await watchPath(dir, options, handler);

      unsubscribeOnDidError = watcher.onDidError(error => {
        const message = `Textual-Velocity: An error occured on watched notes path ${
          dir
        }`;
        atom.notifications.addWarning(message, {
          detail: error.message,
          dismissable: true
        });
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
      if (unsubscribeOnDidError) {
        unsubscribeOnDidError.dispose();
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

function getFilename(dir, path) {
  return path.replace(dir + Path.sep, "");
}
