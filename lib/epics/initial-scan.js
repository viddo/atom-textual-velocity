/* @flow */

import { Observable } from "rxjs";
import Path from "path";
import { Task } from "atom";
import * as A from "../action-creators";

export default function initialScanEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  const dir = store.getState().dir;

  // Scan path in a separate process to not block UI thread
  const taskPath = Path.join(__dirname, "..", "initial-scan-task.js");
  const task = new Task(taskPath);
  task.off = () => {}; // Task.prototype.on already exists, add .off to make it compatible with Observable.fromEvent

  const { filterAndCreateAddAction } = A.makeFilterAndCreateActions(dir);

  return Observable.merge(
    action$.filter(action => {
      if (action.type === A.START_INITIAL_SCAN) {
        task.start(dir);
      }
      return false;
    }),
    Observable.fromEvent(task, "add").map(filterAndCreateAddAction),
    Observable.fromEvent(task, "ready").map(() => {
      const state: State = store.getState();
      if (state.loading.status === "initialScan") {
        return A.initialScanDone(state.loading.rawFiles);
      } else {
        throw new Error(
          `loading.status was expected to be "initialScan", was "${
            state.loading.status
          }"`
        );
      }
    })
  )
    .filter(action => !!action)
    .takeUntil(
      action$.filter(action => action.type === A.DISPOSE).do(() => {
        try {
          task.send("dispose");
        } catch (err) {
          // throws error if task already is terminated
        }
        task.terminate();
      })
    );
}
