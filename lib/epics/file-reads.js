/* @flow */

import Path from "path";
import { Observable } from "rxjs";
import * as A from "../action-creators";
import { getCfg } from "../config";

export default function makeFileReadsEpic(fileReaders: FileReaders) {
  return function fileReadsEpic(
    action$: Observable<Action>,
    store: Store<State, Action>
  ) {
    return Observable.merge(
      action$
        .filter(action => action.type === A.INITIAL_SCAN_DONE)
        .mergeMap(() => {
          const state: State = store.getState();

          return Observable.from(
            state.initialScan.rawFiles
          ).mergeMap(rawFile => {
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
          }, getCfg("concurrentFilesParses"));
        }),

      action$.map(action => {
        if (action.type === A.INITIAL_SCAN_DONE) {
          return A.initialScanRawFilesRead();
        }
      }),

      action$
        .filter(action => {
          switch (action.type) {
            case A.FILE_ADDED:
            case A.FILE_CHANGED:
              const state: State = store.getState();
              return state.initialScan.done;
            default:
              return false;
          }
        })
        .mergeMap((action: any) => {
          const state: State = store.getState();
          const fileReadersArray = fileReaders.map(fileReader => fileReader);
          return makeReadFile$(fileReadersArray, action.rawFile, state.dir);
        })
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

    const read$ = Observable.bindNodeCallback(fileReader.read.bind(fileReader));
    return read$(path, rawFile.stats)
      .map(readFileValue => {
        result.value = readFileValue !== undefined ? readFileValue : null; // make sure value cannot be undefined
        return A.fileRead(result);
      })
      .catch(err => {
        console.warn("failed to read file:", { err, context: result });
        return Observable.empty();
      });
  }, getCfg("concurrentFileReads"));
}
