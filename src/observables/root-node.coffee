createElement = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'

# Transforms a root vdom node into a root node property
module.exports = (rootProp) ->
  rootProp.scan {}, ({rootNode, tree}, newTree) ->
    rootNode: if tree then patch(rootNode, diff(tree, newTree)) else createElement(newTree)
    tree: newTree
  .map('.rootNode')
