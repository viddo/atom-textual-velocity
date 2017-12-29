/* @flow */

import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import tempy from "tempy";
import * as A from "./action-creators";
import newApp from "./react/containers/app";
import newRoot from "./reducers/index";

export default function uiDev(
  panel: atom$Panel,
  columns: Columns,
  fileReaders: FileReaders,
  noteFields: NoteFields
) {
  const rootReducer = newRoot(columns, fileReaders, noteFields);
  const initialState: any = {
    dir: tempy.directory(),
    listHeight: 150
  };
  const store = createStore(rootReducer, initialState);
  const App = newApp(columns);
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    panel.getItem()
  );

  const hiddenColumns = atom.config.get("textual-velocity.hiddenColumns");
  store.dispatch(A.changeHiddenColumns(hiddenColumns));
  const rawFiles = generateRawFiles(20000);
  store.dispatch(A.readDirDone(rawFiles));
}

function generateRawFiles(n) {
  const rawFiles = [];

  for (let i = 0; i < n; i++) {
    const rawFile: RawFile = {
      filename: `note ${i}.md`,
      stats: {
        birthtime: new Date(),
        mtime: new Date()
      }
    };
    rawFiles.push(rawFile);
  }

  return rawFiles;
}
