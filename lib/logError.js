/* @flow */

export default function logError(msg: string, obj: Object) {
  console.error(`${msg}, was ${JSON.stringify(obj)}`);
}
