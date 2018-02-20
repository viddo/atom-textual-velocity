/* @flow */

import Path from "path";
import { Observable } from "rxjs";
import * as A from "../actions";
import fileReaders from "../FileReaders";
import type { Action } from "../actions";
import type { FileReadResult, RawFile } from "../flow-types/File";
import type { IFileReader } from "../flow-types/IFileReader";
import type { State } from "../flow-types/State";

const CONCURRENT_FILE_PARSINGS = 3;
const CONCURRENT_FILE_READS = 3;

export default function fileReadsEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  return Observable.merge(
    action$.filter(({ type }) => type === A.READ_DIR_DONE).mergeMap(action => {
      if (action.type !== A.READ_DIR_DONE) {
        return Observable.empty();
      }

      return Observable.from(action.rawFiles).mergeMap(rawFile => {
        const state: State = store.getState();

        let fileReadersArray = fileReaders.slice(0);
        const note = state.notes[rawFile.filename];
        if (
          note &&
          note.stats.mtime.getTime() === rawFile.stats.mtime.getTime()
        ) {
          fileReadersArray = fileReadersArray.filter(
            fileReader => note[fileReader.notePropName] === undefined
          );
          if (fileReadersArray.length === 0) return Observable.empty(); // e.g. a cached note that have all read values already
        }

        return readFilesAsObservable(fileReadersArray, rawFile, state.dir);
      }, CONCURRENT_FILE_PARSINGS);
    }),

    action$
      .filter(action => {
        switch (action.type) {
          case A.FILE_ADDED:
          case A.FILE_CHANGED:
            return true;
          default:
            return false;
        }
      })
      .mergeMap(action => {
        switch (action.type) {
          case A.FILE_ADDED:
          case A.FILE_CHANGED: {
            const state: State = store.getState();
            return readFilesAsObservable(
              fileReaders,
              action.rawFile,
              state.dir
            );
          }

          default:
            return Observable.empty();
        }
      }),

    action$
      .filter(action => {
        switch (action.type) {
          case A.READ_DIR_DONE:
          case A.FILE_READ:
            return true;
          default:
            return false;
        }
      })
      .debounceTime(200) //ms
      .map(() => {
        const state: State = store.getState();
        if (state.loading.status === "readingFiles") {
          const { readyCount, totalCount } = state.loading;
          if (readyCount === totalCount) {
            return A.readFilesDone();
          }
        }
      })
      .filter(action => !!action)
      .take(1)
  )
    .filter(action => !!action)
    .takeUntil(action$.filter(({ type }) => type === A.DISPOSE).take(1));
}

function readFilesAsObservable(
  fileReadersArray: IFileReader[],
  rawFile: RawFile,
  dir: string
) {
  return Observable.from(fileReadersArray).mergeMap(fileReader => {
    const result: FileReadResult = {
      filename: rawFile.filename,
      notePropName: fileReader.notePropName,
      value: null
    };

    const path = Path.join(dir, rawFile.filename);

    const readAsObservable = Observable.bindNodeCallback(
      fileReader.read.bind(fileReader)
    );
    return readAsObservable(path, rawFile.stats)
      .map(readFileValue => {
        result.value = readFileValue !== undefined ? readFileValue : null; // make sure value cannot be undefined
        return A.fileRead(result);
      })
      .catch(error => {
        const message = `Textual-Velocity: Failed to read file ${path}`;
        atom.notifications.addWarning(message, {
          detail: error.message,
          dismissable: true
        });

        return Observable.of(
          A.fileReadFailed({
            filename: rawFile.filename,
            notePropName: fileReader.notePropName
          })
        );
      });
  }, CONCURRENT_FILE_READS);
}
