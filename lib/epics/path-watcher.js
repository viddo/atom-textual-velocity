/* @flow */

import chokidar from "chokidar";
import { Observable } from "rxjs";
import Path from "path";
import { Task } from "atom";
import * as A from "../action-creators";
import NotesFileFilter from "../notes-file-filter";

export default function pathWatcherEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  const dir = store.getState().dir;

  const fileFilter = new NotesFileFilter(dir, {
    exclusions: atom.config.get("textual-velocity.ignoredNames"),
    excludeVcsIgnoredPaths: atom.config.get(
      "textual-velocity.excludeVcsIgnoredPaths"
    )
  });

  const filterAndCreateAction = (
    actionCreator: (rawFile: RawFile) => Action | void
  ) => (rawFile: RawFile) => {
    const path = Path.join(dir, rawFile.filename);
    if (fileFilter.isAccepted(path)) {
      const { stats } = rawFile;
      if (typeof stats.atime === "string") {
        stats.atime = new Date(stats.atime);
        stats.birthtime = new Date(stats.birthtime);
        stats.ctime = new Date(stats.ctime);
        stats.mtime = new Date(stats.mtime);
      }
      return actionCreator(rawFile);
    }
  };
  const filterAndCreateAddAction = filterAndCreateAction(A.fileAdded);
  const filterAndCreateChangeAction = filterAndCreateAction(A.fileChanged);

  const chokidarOptions: ChokidarOptions = {
    alwaysStat: true,
    cwd: dir,
    depth: 0,
    ignored: "node_modules"
  };
  const chokidarWatch = chokidar.watch(dir, {
    ...chokidarOptions,
    ignoreInitial: true, // initial scan is handled by initialScanTask instead, to not completely block the UI thread
    persistent: true
  });
  chokidarWatch.off = () => {}; // makes task compatible with expected format for Observable.fromEvent

  const initialScanTask = new Task(
    Path.join(__dirname, "..", "initial-scan-task.js")
  );
  initialScanTask.off = () => {}; // makes task compatible with expected format for Observable.fromEvent

  return Observable.merge(
    action$.filter(action => {
      if (action.type === A.START_INITIAL_SCAN) {
        initialScanTask.start(chokidarOptions);
      }
      return false;
    }),
    Observable.fromEvent(initialScanTask, "add").map(filterAndCreateAddAction),
    Observable.fromEvent(initialScanTask, "ready").mapTo(A.initialScanDone()),
    Observable.fromEvent(chokidarWatch, "add", argsToRawFile).map(
      filterAndCreateAddAction
    ),
    Observable.fromEvent(chokidarWatch, "change", argsToRawFile).map(
      filterAndCreateChangeAction
    ),
    Observable.fromEvent(chokidarWatch, "unlink").map(A.fileDeleted)
  )
    .filter(action => !!action)
    .takeUntil(
      action$.filter(action => action.type === A.DISPOSE).do(() => {
        chokidarWatch.close();
        try {
          initialScanTask.send("dispose");
        } catch (err) {
          // throws error if task already is terminated
        }
        initialScanTask.terminate();
      })
    );
}

function argsToRawFile(filename: string, stats: FsStats) {
  const file: RawFile = { filename, stats };
  return file;
}
