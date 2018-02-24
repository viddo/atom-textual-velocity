/* @flow */

import NVtags from "./NVtags";
import ContentFileReader from "./file-readers/ContentFileReader";
import FileIconsReader from "./file-readers/FileIconsReader";
import StatsFileReader from "./file-readers/StatsFileReader";
import NVtagsFileReader from "./NVtags/NVtagsFileReader";
import type { IFileReader } from "./flow-types/IFileReader";

const fileReaders: IFileReader[] = [
  new ContentFileReader(),
  new FileIconsReader(),
  new StatsFileReader()
];
if (NVtags.isSupported()) {
  fileReaders.push(new NVtagsFileReader());
}

export default fileReaders;

export function patchFileReadersForTest(...replacements: Function[]) {
  let original: any;

  beforeEach(() => {
    original = fileReaders.slice(0);
    fileReaders.length = 0;
    replacements.forEach(fn => {
      const fakeFileReader = fn();
      fileReaders.push(fakeFileReader);
    });
  });

  afterEach(() => {
    fileReaders.length = 0;
    original.forEach(x => fileReaders.push(x));
    original = null;
  });
}
