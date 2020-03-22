/* @flow */

import path from "path";
import { bindNodeCallback, empty, from, merge, of } from "rxjs";
import {
  catchError,
  debounceTime,
  filter,
  map,
  mergeMap,
  take,
} from "rxjs/operators";
import { ofType } from "redux-observable";
import * as A from "../actions";
import fileReaders from "../FileReaders";
import takeUntilDispose from "../takeUntilDispose";
import { showWarningNotification } from "../showWarningNotification";

import type { Action } from "../actions";
import type { FileReadResult, RawFile } from "../../flow-types/File";
import type { IFileReader } from "../../flow-types/IFileReader";
import type { State } from "../../flow-types/State";

const CONCURRENT_FILE_PARSINGS = 3;
const CONCURRENT_FILE_READS = 3;

export default function fileReadsEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>
) {
  return merge(
    action$.pipe(
      ofType(A.READ_DIR_DONE),
      mergeMap((action) => {
        // not really necessary other than to make flowtype happy (since already filtered by ofType)
        if (action.type !== A.READ_DIR_DONE) return empty();

        return from(action.rawFiles).pipe(
          mergeMap((rawFile) => {
            const state = state$.value;

            let fileReadersArray = fileReaders.slice(0);
            const note = state.notes[rawFile.filename];
            if (
              note &&
              note.stats.mtime.getTime() === rawFile.stats.mtime.getTime()
            ) {
              fileReadersArray = fileReadersArray.filter(
                (fileReader) => note[fileReader.notePropName] === undefined
              );
              if (fileReadersArray.length === 0) return empty(); // e.g. a cached note that have all read values already
            }

            return readFilesAsObservable(fileReadersArray, rawFile, state.dir);
          }, CONCURRENT_FILE_PARSINGS)
        );
      })
    ),

    action$.pipe(
      filter((action) => {
        switch (action.type) {
          case A.FILE_ADDED:
          case A.FILE_CHANGED:
            return true;
          default:
            return false;
        }
      }),
      mergeMap((action) => {
        switch (action.type) {
          case A.FILE_ADDED:
          case A.FILE_CHANGED: {
            return readFilesAsObservable(
              fileReaders,
              action.rawFile,
              state$.value.dir
            );
          }

          default:
            return empty();
        }
      })
    ),

    action$.pipe(
      filter((action) => {
        switch (action.type) {
          case A.READ_DIR_DONE:
          case A.FILE_READ:
            return true;
          default:
            return false;
        }
      }),
      debounceTime(200),
      map(() => {
        const state = state$.value;
        if (state.loading.status === "readingFiles") {
          const { readyCount, totalCount } = state.loading;
          if (readyCount === totalCount) {
            return A.readFilesDone();
          }
        }
      }),
      filter(Boolean),
      take(1)
    )
  ).pipe(filter(Boolean), takeUntilDispose(action$));
}

function readFilesAsObservable(
  fileReadersArray: IFileReader[],
  rawFile: RawFile,
  dir: string
) {
  return from(fileReadersArray).pipe(
    mergeMap((fileReader) => {
      const result: FileReadResult = {
        filename: rawFile.filename,
        notePropName: fileReader.notePropName,
        value: null,
      };

      const filePath = path.join(dir, rawFile.filename);

      const readAsObservable = bindNodeCallback(
        fileReader.read.bind(fileReader)
      );
      return readAsObservable(filePath, rawFile.stats).pipe(
        map((readFileValue) => {
          result.value = readFileValue !== undefined ? readFileValue : null; // make sure value cannot be undefined
          return A.fileRead(result);
        }),
        catchError((error) => {
          showWarningNotification(`Failed to read file ${filePath}`, error);
          return of(
            A.fileReadFailed({
              filename: rawFile.filename,
              notePropName: fileReader.notePropName,
            })
          );
        })
      );
    }, CONCURRENT_FILE_READS)
  );
}
