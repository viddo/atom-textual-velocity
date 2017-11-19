/* @flow */

import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import type { Reducer } from "redux"; // eslint-disable-line
import thunk from "redux-thunk";
import Disposables from "./disposables";
import * as A from "./action-creators.js";
import NotesFileFilter from "./notes-file-filter";
import newRootReducer from "./reducers/index";
import newApp from "./react/app";
import NotesCache from "./notes-cache";
import RestartSessionForNewConfigToTakeEffect from "./restart-session-for-new-config-to-take-effect";
import ToggleAtomWindow from "./toggle-atom-window";
import TogglePanel from "./toggle-panel";
import activePaneItem from "./epics/active-pane-item";
import atCopyMatchToClipboardEpic from "./epics/at-copy-match-to-clipboard";
import configChanges from "./epics/config-changes";
import fileReads from "./epics/file-reads";
import fileWrites from "./epics/file-writes";
import focusOnSearchWhenClosingLastEditor from "./epics/focus-on-search-when-closing-last-editor";
import hiddenColumns from "./epics/hidden-columns";
import initialScan from "./epics/initial-scan";
import pathWatcher from "./epics/path-watcher";
import previewNote from "./epics/preview-note";

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
    const epicMiddleware = createEpicMiddleware(
      combineEpics(
        activePaneItem,
        atCopyMatchToClipboardEpic,
        configChanges,
        fileReads,
        fileWrites,
        focusOnSearchWhenClosingLastEditor,
        hiddenColumns,
        initialScan,
        pathWatcher,
        previewNote
      ),
      {
        dependencies: {
          columns,
          fileReaders,
          fileWriters,
          notesFileFilter
        }
      }
    );

    const middlewares = applyMiddleware(thunk, epicMiddleware);

    this._notesCache = new NotesCache(dir);
    const initialState: any = {
      notes: await this._notesCache.load(),
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

  async dispose() {
    try {
      await this._notesCache.save(this._store.getState().notes);
    } catch (err) {
      console.warn("textual-velocity: could not cache notes", err);
    }
    this._notesCache.dispose();

    this._store.dispatch(A.dispose());
    this._panel.destroy();
    this._disposables.dispose();
  }
}
