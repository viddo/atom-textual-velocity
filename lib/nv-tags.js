var fs = require('fs')

var XATTR_KEY = 'com.apple.metadata:kMDItemOMUserTags'

// For a *nix compatible platform (targeted MacOSX) this should register custom logic
// to support tags compatible with Notational Velocity (see https://notational.net).
//
// This also services as a canonical example of how to consume the service API,
// to enhance the package with additional file readers, search fields, and columns.
// See http://flight-manual.atom.io/behind-atom/sections/interacting-with-other-packages-via-services/
// E.g. in your package.json:
//   {
//     "consumedServices": {
//       "textual-velocity": {
//         "versions": {
//           "^0.1.0": "consumeTextualVelocityServiceV0"
//         }
//       }
//     }
//   }
module.exports = {

  getUnsupportedError: function () {
    try {
      // Due to being optionalDependencies they might not exist, if that's the case do nothing and just return
      require('bplist')
      var xattr = require('fs-xattr')

      // Filesystem might not support xattrs, verify before continuing
      var OS = require('os')
      var Path = require('path')
      var tmpPath = Path.join(OS.tmpdir(), 'verify-nv-tags' + process.hrtime().toString())
      fs.writeFileSync(tmpPath, '')
      xattr.setSync(tmpPath, XATTR_KEY, 'test writing xattrs')
      fs.unlinkSync(tmpPath)
    } catch (err) {
      return err
    }
  },

  consumeTextualVelocityServiceV0: function (service) {
    if (this.getUnsupportedError()) return

    var bplist = require('bplist')
    var xattr = require('fs-xattr')

    var FILE_PROP_NAME = 'nvtags'
    var FIELD_NAME = 'nvtagstr'

    service.registerFileReaders({
      notePropName: FILE_PROP_NAME,

      read: function (path, callback) {
        if (!xattr) return callback(new Error('xattr no longer available, probably due to package being deactivated while in transit'))

        xattr.get(path, XATTR_KEY, function (err, plistBuf) {
          if (err) {
            if (err.code === 'ENOATTR') {
              callback(null, null) // no xattrs set; return empty list
            } else {
              callback(err) // e.g. file path does not exist or such
            }
          } else {
            bplist.parseBuffer(plistBuf, function (err, list) {
              if (err) {
                callback(err)
              } else {
                callback(null, list[0])
              }
            })
          }
        })
      }
    })

    service.registerFields({
      notePropName: FIELD_NAME,

      value: function (note) {
        var tags = note[FILE_PROP_NAME]
        if (Array.isArray(tags)) {
          return tags.join(' ')
        }
      }
    })

    service.registerColumns({
      title: 'NV tags',
      description: 'NV Tags',
      position: 2, // after Summary
      sortField: FIELD_NAME,
      editCellName: FILE_PROP_NAME,
      width: 20,

      editCellStr: function (note) {
        var tags = note[FILE_PROP_NAME]
        if (Array.isArray(tags)) {
          return tags.join(' ')
        }
      },

      cellContent: function (params) {
        var tags = params.note[FILE_PROP_NAME]
        if (Array.isArray(tags)) {
          var searchMatch = params.searchMatch
          return tags.map(function (tag) {
            return {
              attrs: {className: 'inline-block-tight highlight'},
              content: searchMatch && searchMatch.content(tag) || tag
            }
          })
        }
      }
    })

    service.registerFileWriters({
      editCellName: FILE_PROP_NAME,

      write (path, str, callback) {
        var tags = str.trim().split(' ')

        if (tags.length && tags[0] !== '') {
          var plistBuf = bplist.create([tags])
          xattr.set(path, XATTR_KEY, plistBuf, callback)
        } else {
          xattr.remove(path, XATTR_KEY, callback)
        }

        var now = new Date()
        fs.utimesSync(path, now, now) // update last access/update times
      }
    })

    var editNVTags = function () {
      service.editCell(FILE_PROP_NAME)
    }
    var DisposableValues = require('./disposable-values')
    return new DisposableValues(
      atom.commands.add('.platform-darwin .textual-velocity', 'textual-velocity:edit-nv-tags', editNVTags),
      atom.commands.add('.platform-linux .textual-velocity', 'textual-velocity:edit-nv-tags', editNVTags),
      atom.keymaps.add(__filename, {
        '.platform-darwin .textual-velocity': {
          'cmd-shift-t': 'textual-velocity:edit-nv-tags'
        },
        '.platform-linux .textual-velocity': {
          'ctrl-shift-t': 'textual-velocity:edit-nv-tags'
        }
      })
    )
  }
}
