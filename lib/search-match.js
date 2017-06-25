/* @flow */

export default class SearchMatch {
  _regex: RegExp;

  constructor(regex: RegExp) {
    this._regex = regex;
  }

  content(str: string): SearchMatchContent | void {
    const m = this._regex.exec(str);
    if (!m) return;

    return [
      str.slice(0, m.index),
      {
        attrs: { className: "text-highlight" },
        content: m[0]
      },
      str.slice(m.index + m[0].length)
    ];
  }
}
