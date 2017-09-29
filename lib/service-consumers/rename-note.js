/* @flow */
import fs from "fs";
import Path from "path";
import Disposables from "../disposables";

export default {
  consumeService(service: Service, editCellName: string) {
    service.registerFileWriters({
      editCellName,

      write(oldPath: string, filename: string, callback: Function) {
        filename = filename.split(Path.sep).slice(-1)[0]; // i.e. disallow a filename such as 'other-dir/filename.txt'
        filename = filename && filename.trim();

        if (filename) {
          const rootPath = oldPath
            .split(Path.sep)
            .slice(0, -1)
            .join(Path.sep);

          const newPath = Path.normalize(Path.join(rootPath, filename));

          try {
            fs.renameSync(oldPath, newPath); // https://nodejs.org/api/fs.html#fs_fs_rename_oldpath_newpath_callback
            var now = new Date();
            fs.utimesSync(newPath, now, now); // update last access/update times
          } catch (err) {
            callback(err);
            return;
          }
        }

        callback(null, null);
      }
    });

    return new Disposables(
      atom.commands.add(
        "atom-workspace",
        "textual-velocity:rename-note",
        () => {
          atom.config.set("textual-velocity.editCellName", editCellName);
        }
      )
    );
  }
};
