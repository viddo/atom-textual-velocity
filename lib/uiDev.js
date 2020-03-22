/* @flow */

import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import tempy from "tempy";
import * as A from "./actions";
import App from "./react/containers/App";
import rootReducer from "./reducers/index";
import statsMock from "../spec/statsMock";

import type { Panel } from "atom";
import type { RawFile } from "../flow-types/File";

atom.commands.add("atom-workspace", "textual-velocity:ui-dev", () => {
  const panel = atom.workspace.addTopPanel({
    item: document.createElement("div"),
  });
  uiDev(panel);
});

export default function uiDev(panel: Panel) {
  const initialState: any = {
    dir: tempy.directory(),
    listHeight: 150,
  };
  const store = createStore(rootReducer, initialState);
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
      stats: statsMock({
        birthtime: new Date(),
        mtime: new Date(),
      }),
    };
    rawFiles.push(rawFile);
  }

  return rawFiles;
}
