Bacon = require 'baconjs'

module.exports = {

  fromDisposable: (obj, funcName, args...) ->
    Bacon.fromBinder (sink) ->
      args.push(sink)
      disposable = obj[funcName].apply(obj, args)
      return -> disposable.dispose()

  fromConfig: (key) ->
    @fromDisposable atom.config, 'observe', key

}
