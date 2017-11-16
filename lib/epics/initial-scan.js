/* @flow */

import fs from "fs";
import Path from "path";
import { Observable, Subject } from "rxjs";
import * as A from "../action-creators";

export default function makeInitialScanEpic(notesFileFilter: NotesFileFilter) {
  return function initialScanEpic(
    action$: Observable<Action>,
    store: Store<State, Action>
  ) {
    const dir = store.getState().dir;

    const readdirAsObservable = Observable.bindNodeCallback(fs.readdir);
    const rawFile$ = readdirAsObservable(dir)
      .catch(error => {
        const message = `Textual-Velocity: Failed to read directory ${dir}`;
        atom.notifications.addWarning(message, {
          detail: error.message,
          dismissable: true
        });
        return Observable.empty();
      })
      .mergeMap(filenames => Observable.from(filenames))
      .filter(filename => notesFileFilter.isAccepted(filename))
      .mergeMap(filename => {
        const statAsObservable = Observable.bindNodeCallback(fs.stat);
        const path = Path.join(dir, filename);

        return statAsObservable(path)
          .map(stats => {
            if (stats.isFile()) {
              return {
                filename,
                stats
              };
            }
          })
          .catch(error => {
            const message = `Textual-Velocity: Failed to stat file ${path}`;
            atom.notifications.addWarning(message, {
              detail: error.message,
              dismissable: true
            });
            return Observable.empty();
          });
      })
      .filter(rawFile => !!rawFile)
      .multicast(new Subject());

    const subscriptionConnect = rawFile$.connect();

    return Observable.merge(
      rawFile$.map(() => A.fileFound()),

      rawFile$
        .buffer(rawFile$.last())
        .map(rawFiles => {
          return A.initialScanDone(rawFiles);
        })
        .take(1)
    ).takeUntil(
      action$
        .filter(action => action.type === A.DISPOSE)
        .do(() => {
          subscriptionConnect.unsubscribe();
        })
        .take(1)
    );
  };
}
