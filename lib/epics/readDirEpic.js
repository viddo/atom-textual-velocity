/* @flow */

import fs from "fs";
import Path from "path";
import { Observable, Subject } from "rxjs";
import * as A from "../actions";
import type { Action } from "../actions";
import type { State } from "../flow-types/State";
import NotesFileFilter from "../NotesFileFilter";

export default function readDirEpic(
  action$: Observable<Action>,
  store: Store<State, Action>,
  { notesFileFilter }: { notesFileFilter: typeof NotesFileFilter }
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
        return A.readDirDone(rawFiles);
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
}