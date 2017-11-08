/* @flow */
/* global emit */

// NOTE: don't import anything that relies on remote.require (neither in the dependency chain),
// since that's not available in the task context
import chokidar from "chokidar";
import makeChokidarOptions from "./chokidar-options";

// Scan path in a separate process to not block UI thread
export default function(dir: string) {
  const chokidarOptions = makeChokidarOptions(dir, {
    ignoreInitial: false,
    persistent: false
  });

  const chokidarWatch = chokidar.watch(dir, chokidarOptions);

  const done = this.async();
  const dispose = () => {
    chokidarWatch.close(); // make sure to cleanup if process is terminated
    done();
  };

  chokidarWatch.on("add", (filename: string, stats: FsStats) => {
    emit("add", ({ filename, stats }: RawFile));
  });

  chokidarWatch.on("ready", () => {
    emit("ready");
    dispose();
  });

  process.on("message", () => {
    // expected to be called upon task.send("dispose"); when task should be terminated prematurely
    // e.g. user deactivates session before the task has finished, or similar
    dispose();
  });
}
