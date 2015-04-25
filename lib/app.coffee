createElement = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'

module.exports = class App
  rootNode: undefined
  prevTree: undefined

  constructor: (renderedTree) ->
    renderedTree.onValue (newTree) =>
      if @rootNode
        @rootNode = patch(@rootNode, diff(@prevTree, newTree))
      else
        @rootNode = createElement(newTree)
        @panel = atom.workspace.addTopPanel {
          item: @rootNode
        }
      @prevTree = newTree

  dispose: ->
    @panel?.destroy()
    @prevTree = null
    @rootNode = null
