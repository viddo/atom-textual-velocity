// For a *nix compatible platform (targeted MacOSX) this should register custom logic
// to support tags compatible with Notational Velocity (see https://notational.net).
// NOTE: using CommonJS module, to be able to check if prerequisite deps are available
const fs = require("fs");
const tempy = require("tempy");

let bplist = null;
let xattr = null;
let unsupportedError = null;
const XATTR_KEY = "com.apple.metadata:kMDItemOMUserTags";

try {
  if (!atom.config.get("textual-velocity.xattrs")) {
    throw new Error("xattrs disabled by config: textual-velocity.xattrs");
  }
  // Due to being optionalDependencies they might not exist, if that's the case do nothing and just return
  bplist = require("bplist");
  xattr = require("fs-xattr");

  // Filesystem might not support xattrs, verify before continuing
  var tmpPath = tempy.file();
  fs.writeFileSync(tmpPath, "");
  xattr.setSync(tmpPath, XATTR_KEY, "test writing xattrs");
} catch (error) {
  fs.writeSync(1, `NVtags not supported: ${error}`);
  unsupportedError = error;
}

let read = (path, callback) => {
  callback(unsupportedError);
};
let write = (path, tags, callback) => {
  callback(unsupportedError);
};

if (!unsupportedError) {
  read = (path, callback) => {
    xattr.get(path, XATTR_KEY, function (error, plistBuf) {
      if (error) {
        if (error.code === "ENOATTR") {
          callback(null, null); // no xattrs set; return empty list
        } else {
          callback(error); // e.g. file path does not exist or such
        }
      } else {
        bplist.parseBuffer(plistBuf, function (error, list) {
          if (error) {
            callback(error);
          } else {
            callback(null, list[0]);
          }
        });
      }
    });
  };

  write = (path, tags, callback) => {
    if (typeof tags === "string") {
      tags = tags.trim().split(" ");
    } else if (!Array.isArray(tags)) {
      throw new Error("tags must either be a string or an array");
    }

    // filter out duplicates and empty strings
    tags = tags.reduce((memo, val) => {
      if (typeof val === "string") {
        val = val.trim();
        if (val && memo.indexOf(val) === -1) {
          memo.push(val);
        }
      }
      return memo;
    }, []);

    if (tags.length && tags[0] !== "") {
      const plistBuf = bplist.create([tags]);
      xattr.set(path, XATTR_KEY, plistBuf, (error) => {
        callback(error, tags);
      });
    } else {
      xattr.remove(path, XATTR_KEY, callback);
    }

    const now = new Date();
    fs.utimesSync(path, now, now); // update last access/update times
  };
}

module.exports = {
  unsupportedError,
  read,
  write,
};
