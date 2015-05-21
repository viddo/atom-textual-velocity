createElement = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'

module.exports = (rootProp) ->
  return rootProp.scan {}, ({rootNode, tree}, newTree) ->
    rootNode: if tree then patch(rootNode, diff(tree, newTree)) else createElement(newTree)
    tree: newTree
  .map('.rootNode')
