Bacon = require('baconjs')
createElement = require('virtual-dom/create-element')
diff = require('virtual-dom/diff')
patch = require('virtual-dom/patch')
vdomTrees = require('../src/vdom-trees.coffee')

module.exports = (streams) ->
  { bodyHeightStream } = streams
  bodyHeightBus = new Bacon.Bus()
  scrollTopBus = new Bacon.Bus()
  bodyHeightStream = bodyHeightStream.merge(bodyHeightBus)

  vdomTreesProp = vdomTrees streams, {
    scrollTopBus: scrollTopBus
    bodyHeightBus: bodyHeightBus
  }

  return {
    changedHeightStream: bodyHeightStream

    rootNodeProp: vdomTreesProp.scan undefined, (rootNode, [currentTree, newTree]) ->
      if newTree
        patch(rootNode, diff(currentTree, newTree))
      else
        createElement(currentTree)
  }
