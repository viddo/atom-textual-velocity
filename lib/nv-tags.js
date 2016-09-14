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

  consumeTextualVelocityServiceV0: function (service) {
    var bplist, xattr

    // Due to being optionalDependencies they might not exist, if that's the case do nothing and just return
    try {
      bplist = require('bplist')
      xattr = require('fs-xattr')
    } catch (err) {
      return
    }

    var XATTR_KEY = 'com.apple.metadata:kMDItemOMUserTags'
    var PROP_NAME = 'nvtags'

    // A file reader is called on each new and changed file, to fetch additional metadata from the file.
    // Note that this should _not_ be used for additional data you want to be indexed for search or displayed.
    // the data returned is set on `file.data[propName]` where propName
    service.registerFileReaders({
      propName: PROP_NAME,

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
      name: PROP_NAME,

      value: function (file) {
        var tags = file.data[PROP_NAME]
        if (!Array.isArray(tags)) return

        return tags.join(' ')
      }
    })

    service.registerColumns({
      title: 'NV tags',
      description: 'NV Tags',
      position: 1,
      sortField: PROP_NAME,
      editCellName: PROP_NAME,
      width: 20,

      editCellStr (file) {
        var tags = file.data[PROP_NAME]
        return tags && tags.join(' ')
      },

      cellContent: function (file, searchMatch) {
        var tags = file.data[PROP_NAME]
        if (!Array.isArray(tags)) return ''

        return tags.map(function (tag) {
          return {
            attrs: {className: 'inline-block-tight highlight'},
            content: searchMatch && searchMatch.content(tag) || tag
          }
        })
      }
    })

    service.registerFileWriters({
      editCellName: PROP_NAME,

      write (path, str, callback) {
        // https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
        var tags = str.split(' ')
        var plistBuf = bplist.create([tags])
        xattr.set(path, XATTR_KEY, plistBuf, callback)
      }
    })

    var editNVTags = function () {
      service.editCell(PROP_NAME)
    }

    var DisposableValues = require('./disposable-values')
    return new DisposableValues(
      atom.commands.add('.platform-darwin', 'textual-velocity:edit-nv-tags', editNVTags),
      atom.commands.add('.platform-linux', 'textual-velocity:edit-nv-tags', editNVTags),
      atom.keymaps.add(__filename, {
        '.platform-darwin': {
          'cmd-shift-t': 'textual-velocity:edit-nv-tags'
        },
        '.platform-linux': {
          'ctrl-shift-t': 'textual-velocity:edit-nv-tags'
        }
      })
    )
  }
}
