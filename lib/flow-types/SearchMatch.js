/* @flow */

export type SearchMatchContent = [string, Object, string];

export type SearchMatch = {
  content(str: string): SearchMatchContent | void
};
