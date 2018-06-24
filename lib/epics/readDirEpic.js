/* @flow */

import fs from "fs";
import path from "path";
import { bindNodeCallback, empty, from, merge, Subject } from "rxjs";
import {
  buffer,
  catchError,
  filter,
  finalize,
  last,
  map,
  mergeMap,
  multicast,
  take
} from "rxjs/operators";
import * as A from "../actions";
import type { Action } from "../actions";
import type { State } from "../flow-types/State";
import NotesFileFilter from "../NotesFileFilter";
import takeUntilDispose from "../takeUntilDispose";

export default function readDirEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>,
  { notesFileFilter }: { notesFileFilter: typeof NotesFileFilter }
) {
  const { dir } = state$.value;

  const readdirAsObservable = bindNodeCallback(fs.readdir);
  const rawFile$ = readdirAsObservable(dir).pipe(
    catchError(error => {
      const message = `Textual-Velocity: Failed to read directory ${dir}`;
      atom.notifications.addWarning(message, {
        detail: error.message,
        dismissable: true
      });
      return empty();
    }),
    mergeMap(filenames => from(filenames)),
    filter(filename => notesFileFilter.isAccepted(filename)),
    mergeMap(filename => {
      const statAsObservable = bindNodeCallback(fs.stat);
      const filePath = path.join(dir, filename);

      return statAsObservable(filePath).pipe(
        map(stats => {
          if (stats.isFile()) {
            return {
              filename,
              stats
            };
          }
        }),
        catchError(error => {
          const message = `Textual-Velocity: Failed to stat file ${filePath}`;
          atom.notifications.addWarning(message, {
            detail: error.message,
            dismissable: true
          });
          return empty();
        })
      );
    }),
    filter(Boolean),
    multicast(new Subject())
  );

  const subscriptionConnect = rawFile$.connect();

  return merge(
    rawFile$.pipe(map(() => A.fileFound())),

    rawFile$.pipe(
      buffer(rawFile$.pipe(last())),
      map(rawFiles => {
        return A.readDirDone(rawFiles);
      }),
      take(1)
    )
  ).pipe(
    takeUntilDispose(action$),
    finalize(() => {
      subscriptionConnect.unsubscribe();
    })
  );
}
