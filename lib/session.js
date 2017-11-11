/* @flow */

import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import type { Reducer } from "redux"; // eslint-disable-line
import thunk from "redux-thunk";
import Disposables from "./disposables";
import { startInitialScan, dispose } from "./action-creators.js";
import makeEpicMiddleware from "./epics/index";
import makeRootReducer from "./reducers/index";
import makeApp from "./react/app";
import NotesCache from "./notes-cache";
import RestartSessionForNewConfigToTakeEffect from "./restart-session-for-new-config-to-take-effect";
import ToggleAtomWindow from "./toggle-atom-window";
import TogglePanel from "./toggle-panel";

export default class Session {
  _notesCache: NotesCache;
  _panel: atom$Panel;
  _store: Store;
  _disposables: Disposables;

  async start(
    dir: string,
    columns: Columns,
    fileReaders: FileReaders,
    fileWriters: FileWriters,
    noteFields: NoteFields
  ) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement("div")
    });

    const rootReducer: Reducer<State, Action> = makeRootReducer(
      columns,
      fileReaders,
      noteFields
    );
    const middlewares = applyMiddleware(
      thunk,
      makeEpicMiddleware(dir, columns, fileReaders, fileWriters)
    );

    this._notesCache = new NotesCache(dir);
    const initialState: any = {
      notes: await this._notesCache.load(),
      dir
    };
    this._store = createStore(rootReducer, initialState, middlewares);

    const App = makeApp(columns);
    render(
      <Provider store={this._store}>
        <App />
      </Provider>,
      this._panel.getItem()
    );

    if (global.setProcessInTesting) {
      global.setProcessInTesting(process, { store: this._store });
    }

    this._store.dispatch(startInitialScan());

    this._disposables = new Disposables(
      new TogglePanel(this._panel),
      new ToggleAtomWindow(this._panel),
      new RestartSessionForNewConfigToTakeEffect()
    );
  }

  async dispose() {
    try {
      await this._notesCache.save(this._store.getState().notes);
    } catch (err) {
      console.warn("textual-velocity: could not cache notes", err);
    }
    this._notesCache.dispose();

    this._store.dispatch(dispose());
    this._panel.destroy();
    this._disposables.dispose();
  }
}
