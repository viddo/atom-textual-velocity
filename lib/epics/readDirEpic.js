/* @flow */

import fs from "fs";
import path from "path";
import { bindNodeCallback, empty, from, merge, of, Subject } from "rxjs";
import {
  buffer,
  catchError,
  filter,
  finalize,
  last,
  map,
  mergeMap,
  multicast,
  take,
} from "rxjs/operators";
import * as A from "../actions";
import NotesFileFilter from "../NotesFileFilter";
import takeUntilDispose from "../takeUntilDispose";
import { showWarningNotification } from "../showWarningNotification";

import type { Action } from "../actions";
import type { State } from "../../flow-types/State";

export default function readDirEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>,
  { notesFileFilter }: { notesFileFilter: typeof NotesFileFilter }
) {
  const { dir } = state$.value;

  const readdirAsObservable = bindNodeCallback(fs.readdir);
  const rawFile$ = readdirAsObservable(dir).pipe(
    catchError((error) => {
      showWarningNotification(`Failed to read directory ${dir}`, error);
      return empty();
    }),
    mergeMap((filenames) => from(filenames)),
    filter((filename) => notesFileFilter.isAccepted(filename)),
    mergeMap((filename) => {
      const filePath = path.join(dir, filename);

      const statAsObservable = bindNodeCallback(fs.stat);
      return statAsObservable(filePath).pipe(
        map((stats) => {
          if (stats.isFile()) {
            return {
              filename,
              stats,
            };
          }
        }),
        catchError((error) => {
          showWarningNotification(`Failed to stat file ${filePath}`, error);
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
      buffer(
        rawFile$.pipe(
          last(),
          catchError(() => {
            // If there are no rawFiles last will yield an EmptyError,
            // yield an empty list instead of erroring out
            return of([]);
          })
        )
      ),
      map((rawFiles) => A.readDirDone(rawFiles)),
      take(1)
    )
  ).pipe(
    takeUntilDispose(action$),
    finalize(() => {
      subscriptionConnect.unsubscribe();
    })
  );
}
