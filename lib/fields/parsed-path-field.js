/* @flow */

import Path from "path";

export default class ParsedPathField {
  notePropName: string;
  _parsedPathPropName: string;

  value: void | ((note: Note, filename: string) => any);

  constructor(params: { notePropName: string, parsedPathPropName: string }) {
    this.notePropName = params.notePropName;
    this._parsedPathPropName = params.parsedPathPropName;
  }

  value(note: Note, filename: string): any {
    return (
      Path.parse(filename)
        [this._parsedPathPropName] // MacOSX encodes non-ASCII characters by combined form, that although is rendered in the same way has a
        // different representation in memory, so called "unicode codepoints".
        //
        // E.g. a filename named 'älg.txt' would store the "ä" using the two code points:
        // a is https://codepoints.net/U+0061 aka LATIN SMALL LETTER A
        // ¨ is https://codepoints.net/U+308 aka COMBINING DIAERESIS
        //
        // the normalize call here makes sure the string is using the single character representation instead,
        // i.e. https://codepoints.net/U+00E4 aka LATIN SMALL LETTER A WITH DIAERESIS
        //
        // References:
        // - https://developer.apple.com/library/content/qa/qa1173/_index.html
        // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
        .normalize("NFC")
    );
  }
}
