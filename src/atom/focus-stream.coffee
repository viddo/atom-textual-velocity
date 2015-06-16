atoms = require './streams'

# Creates a stream that triggers when double-escaped in editor
module.exports = ->
  resetVimCommandStream = atoms.fromCommand 'atom-text-editor.vim-mode', 'vim-mode:reset-command-mode'
  coreCancelStream      = atoms.fromCommand 'atom-text-editor', 'core:cancel'

  resetVimCommandStream.merge(coreCancelStream)
    .bufferWithTimeOrCount(300, 2)
    .filter (x) -> x.length is 2
