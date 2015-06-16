createElement = require 'virtual-dom/create-element'
diff          = require 'virtual-dom/diff'
patch         = require 'virtual-dom/patch'

# @param {Property} vdomTreeProp root
# @return a prop with an HTML element
module.exports = (vdomTreeProp) ->
  vdomTreeProp.scan {}, ({element, tree}, newTree) ->
    element: if tree then patch(element, diff(tree, newTree)) else createElement(newTree)
    tree: newTree
  .map('.element')
