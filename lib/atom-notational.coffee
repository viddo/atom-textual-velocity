renderBase = require './virtual-dom/render-base'
createElement = require 'virtual-dom/create-element'
BetterTable = require './custom-elements/better-table'

module.exports =
  panel: undefined,

  activate: (state) ->
    tree = renderBase()
    rootNode = createElement(tree)
    @panel = atom.workspace.addTopPanel {
      item: rootNode
    }
    # atom.commands.add 'atom-workspace', {
    #   'atom-notational:toggle': => @_createPanel().toggle()
    # }

  deactivate: ->


  # _createPanel: ->
  #   unless @panel
  #     rootView = new NotationalFilterElement
  #     @panel = atom.workspace.addTopPanel {
  #       item: rootView
  #     }
  #   return @panel
