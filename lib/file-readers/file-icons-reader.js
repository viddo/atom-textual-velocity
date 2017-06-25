/* @flow */

// File reader for integration with https://atom.io/packages/file-icons
export default class FileIconsReader {
  notePropName: string;
  _fileIconsService: { iconClassForPath: (path: string) => Array<string> };

  constructor(fileIconsService: {
    iconClassForPath: (path: string) => Array<string>
  }) {
    this._fileIconsService = fileIconsService;
    this.notePropName = "fileIcons";
  }

  read(path: string, stats: FsStats, callback: NodeCallback) {
    let classNames = this._fileIconsService.iconClassForPath(path);

    if (classNames instanceof Array) {
      classNames = classNames.join(" ");
    } else if (typeof classNames !== "string") {
      classNames = null;
    }

    callback(null, classNames);
  }
}
