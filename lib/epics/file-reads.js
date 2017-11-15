/* @flow */

import Path from "path";
import { Observable } from "rxjs";
import * as A from "../action-creators";

const CONCURRENT_FILE_PARSINGS = 3;
const CONCURRENT_FILE_READS = 3;

export default function makeFileReadsEpic(fileReaders: FileReaders) {
  return function fileReadsEpic(
    action$: Observable<Action>,
    store: Store<State, Action>
  ) {
    return Observable.merge(
      action$
        .filter(action => action.type === A.INITIAL_SCAN_DONE)
        .mergeMap(action => {
          if (action.type !== A.INITIAL_SCAN_DONE) {
            return Observable.empty();
          }

          return Observable.from(action.rawFiles).mergeMap(rawFile => {
            const state: State = store.getState();

            let fileReadersArray = fileReaders.map(fileReader => fileReader);
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

            return makeReadFile$(fileReadersArray, rawFile, state.dir);
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
        .mergeMap((action: any) => {
          const state: State = store.getState();
          const fileReadersArray = fileReaders.map(fileReader => fileReader);
          return makeReadFile$(fileReadersArray, action.rawFile, state.dir);
        }),

      action$
        .filter(action => {
          switch (action.type) {
            case A.INITIAL_SCAN_DONE:
            case A.FILE_READ:
              return true;
            default:
              return false;
          }
        })
        .debounceTime(200) //ms
        .map(action => {
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
      .takeUntil(action$.filter(action => action.type === A.DISPOSE));
  };
}

function makeReadFile$(
  fileReadersArray: FileReader[],
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
        atom.notifications.addError(message, {
          stack: error.stack,
          detail: error.message,
          dismissable: true
        });

        return Observable.empty();
      });
  }, CONCURRENT_FILE_READS);
}
