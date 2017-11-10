/* @flow */

import chokidar from "chokidar";
import { Observable } from "rxjs";
import Path from "path";
import { Task } from "atom";
import * as A from "../action-creators";
import makeChokidarOptions from "../chokidar-options";

export default function makePathWatcherEpic(notesFileFilter: NotesFileFilter) {
  return function pathWatcherEpic(
    action$: Observable<Action>,
    store: Store<State, Action>
  ) {
    const dir = store.getState().dir;

    const chokidarOptions = makeChokidarOptions(dir, {
      ignoreInitial: true, // initial scan is handled by initialScan epic
      persistent: true
    });
    const chokidarWatch = chokidar.watch(dir, chokidarOptions);
    if (global.setProcessInTesting) {
      global.setProcessInTesting(process, { chokidarWatch });
    }
    chokidarWatch.off = () => {}; // makes task compatible with expected format for Observable.fromEvent

    return Observable.merge(
      Observable.fromEvent(chokidarWatch, "add", argsToRawFile)
        .filter(rawFile => notesFileFilter.isAccepted(rawFile))
        .map(A.fileAdded),

      Observable.fromEvent(chokidarWatch, "change", argsToRawFile)
        .filter(rawFile => notesFileFilter.isAccepted(rawFile))
        .map(A.fileChanged),

      Observable.fromEvent(chokidarWatch, "unlink").map(A.fileDeleted)
    )
      .filter(action => !!action)
      .takeUntil(
        action$.filter(action => action.type === A.DISPOSE).do(() => {
          chokidarWatch.close();
        })
      );
  };
}

function argsToRawFile(filename: string, stats: FsStats) {
  const file: RawFile = { filename, stats };
  return file;
}
