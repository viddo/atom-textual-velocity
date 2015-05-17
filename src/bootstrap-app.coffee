Bacon = require('baconjs')
createElement = require('virtual-dom/create-element')
diff = require('virtual-dom/diff')
patch = require('virtual-dom/patch')
vdomTrees = require('../src/vdom-trees.coffee')

module.exports = (streams) ->
  bodyHeightBus = new Bacon.Bus()
  scrollTopBus = new Bacon.Bus()
  searchBus = new Bacon.Bus()
  streams.bodyHeightStream = streams.bodyHeightStream.merge(bodyHeightBus)

  vdomTreesProp = vdomTrees streams, {
    scrollTopBus: scrollTopBus
    bodyHeightBus: bodyHeightBus
    searchBus: searchBus
  }

  return {
    newBodyHeightStream: streams.bodyHeightStream

    rootNodeProp: vdomTreesProp.scan({}, ({rootNode, tree}, newTree) ->
        return {
          rootNode: if tree then patch(rootNode, diff(tree, newTree)) else createElement(newTree)
          tree: newTree
        }
      ).map ({ rootNode }) -> rootNode
  }
