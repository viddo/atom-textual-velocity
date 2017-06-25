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

const privates = new WeakMap();

export default class Session {
  async start(
    dir: string,
    columns: Columns,
    fileReaders: FileReaders,
    fileWriters: FileWriters,
    noteFields: NoteFields
  ) {
    const panel = atom.workspace.addTopPanel({
      item: document.createElement("div")
    });

    const rootReducer: Reducer<State, Action> = makeRootReducer(
      columns,
      fileReaders,
      noteFields
    );
    const middlewares = applyMiddleware(
      thunk,
      makeEpicMiddleware(columns, fileReaders, fileWriters)
    );

    const notesCache = new NotesCache(dir);
    const initialState: any = {
      notes: await notesCache.load(),
      dir
    };
    const store = createStore(rootReducer, initialState, middlewares);

    const App = makeApp(columns);
    render(
      <Provider store={store}>
        <App />
      </Provider>,
      panel.getItem()
    );

    store.dispatch(startInitialScan());

    privates.set(this, {
      notesCache,
      panel,
      store,
      disposables: new Disposables(
        new TogglePanel(panel),
        new ToggleAtomWindow(panel),
        new RestartSessionForNewConfigToTakeEffect()
      )
    });
  }

  async dispose() {
    const { notesCache, panel, store, disposables } = privates.get(this) || {};

    try {
      await notesCache.save(store.getState().notes);
    } catch (err) {
      console.warn("textual-velocity: could not cache notes", err);
    }
    notesCache.dispose();

    store.dispatch(dispose());
    panel.destroy();
    disposables.dispose();

    privates.delete(this);
  }
}
