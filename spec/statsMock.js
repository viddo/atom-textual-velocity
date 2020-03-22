/* @flow */

import { Stats } from "fs";

export default function statsMock(data: Object = {}): Stats {
  const stats = new Stats();
  Object.keys(data).forEach((key) => {
    // $FlowFixMe
    stats[key] = data[key];
  });
  return stats;
}
