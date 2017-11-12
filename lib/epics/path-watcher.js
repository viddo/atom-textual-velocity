/* @flow */

import { watchPath } from "atom";
import fs from "fs";
import Path from "path";
import { Observable } from "rxjs";
import * as A from "../action-creators";

export default function makePathWatcherEpic(notesFileFilter: NotesFileFilter) {
  return function pathWatcherEpic(
    action$: Observable<Action>,
    store: Store<State, Action>
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
            const action = A.fileDeleted(getFilename(dir, event));
            return Observable.of(action);

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
      .takeUntil(action$.filter(action => action.type === A.DISPOSE).take(1));
  };
}

function newEventPatternHandlers(dir: string) {
  let watcher: atom$PathWatcher;
  const addHandler = handler => {
    // necessary to comply with fromEventPattern's params signature,
    // that doesnt expect an async fn
    const innerHandler = async () => {
      const options = {}; // there are no options, for now just a placeholder for the future
      watcher = await watchPath(dir, options, handler);
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
        filename: getFilename(dir, event),
        stats
      });

    case "modified":
      return A.fileChanged({
        filename: getFilename(dir, event),
        stats
      });
  }
}

function getFilename(dir, event) {
  return event.path.replace(dir + Path.sep, "");
}
