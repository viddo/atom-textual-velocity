{TextEditor} = require 'atom'

# Extends the default TextEditor, to implement the "preview" behavior in the context of atom-notational
module.exports =
class PreviewEditor extends TextEditor

  constructor: ->
    super

    # NO-OPs, treat an open editor as a read-only doc
    @getBuffer().save = ->
    @getBuffer().saveAs = ->
