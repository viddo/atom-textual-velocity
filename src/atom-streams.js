'use babel';

import Bacon from 'baconjs';

let fromDisposable = (obj, funcName, ...args) => {
  return Bacon.fromBinder(sink => {
    args.push(sink);
    let disposable = obj[funcName].apply(obj, args);
    return () => disposable.dispose();
  });
};

let fromCommand = (context, command) => {
  return fromDisposable(atom.commands, 'add', context, command);
};

export default {
  fromCommand: fromCommand,

  fromConfig(key) {
    return fromDisposable(atom.config, 'observe', key);
  },

  projectsPaths() {
    let lastProjectPathsProp = Bacon.sequentially(0, [[], atom.project.getPaths()])
      .merge(fromDisposable(atom.project, 'onDidChangePaths'))
      .slidingWindow(2, 2);

    let fromFilteredPairs = (pairwiseStream, predicate) => {
      return pairwiseStream.flatMap(pair =>
        Bacon.sequentially(0, predicate(pair))
      );
    };

    return {
      openStream: fromFilteredPairs(lastProjectPathsProp, ([currentPaths, newPaths]) =>
        newPaths.filter(path => currentPaths.indexOf(path) < 0)
      ),

      closeStream: fromFilteredPairs(lastProjectPathsProp, ([currentPaths, newPaths]) =>
        currentPaths.filter(path => newPaths.indexOf(path) < 0)
      ),
    };
  },

  cancelCommand() {
    let resetVimStream   = fromCommand('atom-text-editor.vim-mode', 'vim-mode:reset-normal-mode');
    let coreCancelStream = fromCommand('atom-text-editor', 'core:cancel');
    return resetVimStream.merge(coreCancelStream);
  },

};
