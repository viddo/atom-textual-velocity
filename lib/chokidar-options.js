/* @flow */

export default function makeChokidarOptions(
  dir: string,
  options: OptionalChokidarOptions
): ChokidarOptions {
  return {
    cwd: dir,
    alwaysStat: true,
    depth: 0,
    ignored: "node_modules",
    ...options
  };
}
