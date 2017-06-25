/* @flow */
/* global emit */

import chokidar from "chokidar";

// Scan path in a separate process to not block UI thread
export default function(chokidarOptions: ChokidarOptions) {
  chokidarOptions = {
    ...chokidarOptions,
    ignoreInitial: false,
    persistent: false
  };
  const chokidarWatch = chokidar.watch(chokidarOptions.cwd, chokidarOptions);

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
    // finished prematurely, e.g. user deactivates session before the task has finished, or similar
    dispose();
  });
}
