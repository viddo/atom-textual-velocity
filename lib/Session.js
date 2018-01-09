/* @flow */

import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import type { Reducer } from "redux"; // eslint-disable-line
import Disposables from "./Disposables";
import * as A from "./actions.js";
import epics from "./epics";
import NotesFileFilter from "./NotesFileFilter";
import newApp from "./react/containers/App";
import newRootReducer from "./reducers/index";
import NotesCache from "./NotesCache";
import RestartSessionForNewConfigToTakeEffect from "./RestartSessionForNewConfigToTakeEffect";
import ToggleAtomWindow from "./ToggleAtomWindow";
import TogglePanel from "./TogglePanel";
import type { Action } from "./actions";
import type { IColumns } from "./flow-types/IColumns";
import type { IFileReaders } from "./flow-types/IFileReaders";
import type { IFileWriters } from "./flow-types/IFileWriters";
import type { INoteFields } from "./flow-types/INoteFields";
import type { State } from "./flow-types/State";

export default class Session {
  _notesCache: NotesCache;
  _panel: atom$Panel;
  _store: Store;
  _disposables: Disposables;

  start(
    dir: string,
    columns: IColumns,
    fileReaders: IFileReaders,
    fileWriters: IFileWriters,
    noteFields: INoteFields
  ) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement("div")
    });

    const rootReducer: Reducer<State, Action> = newRootReducer(
      columns,
      fileReaders,
      noteFields
    );
    const notesFileFilter = new NotesFileFilter(dir, {
      exclusions: atom.config.get("textual-velocity.ignoredNames"),
      excludeVcsIgnoredPaths: atom.config.get(
        "textual-velocity.excludeVcsIgnoredPaths"
      )
    });
    const epicMiddleware = createEpicMiddleware(epics, {
      dependencies: {
        columns,
        fileReaders,
        fileWriters,
        notesFileFilter
      }
    });

    const middlewares = applyMiddleware(epicMiddleware);

    this._notesCache = new NotesCache(dir);
    const initialState: any = {
      notes: this._notesCache.load(),
      dir
    };
    this._store = createStore(rootReducer, initialState, middlewares);

    const App = newApp(columns);
    render(
      <Provider store={this._store}>
        <App />
      </Provider>,
      this._panel.getItem()
    );

    if (global.setProcessInTesting) {
      global.setProcessInTesting(process, { store: this._store });
    }

    this._disposables = new Disposables(
      new TogglePanel(this._panel),
      new ToggleAtomWindow(this._panel),
      new RestartSessionForNewConfigToTakeEffect()
    );
  }

  dispose() {
    this._notesCache.save(this._store.getState().notes);
    this._notesCache.dispose();

    this._store.dispatch(A.dispose());
    this._panel.destroy();
    this._disposables.dispose();
  }
}
