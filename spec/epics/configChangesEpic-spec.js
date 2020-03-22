/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import configChangesEpic from "../../lib/epics/configChangesEpic";
import * as A from "../../lib/actions";

describe("epics/configChangesEpic", () => {
  let store;

  beforeEach(() => {
    jasmine.Clock.useMock();
    const epicMiddleware = createEpicMiddleware();
    const mockStore = configureMockStore([epicMiddleware]);
    store = mockStore();
    epicMiddleware.run(configChangesEpic);
  });

  afterEach(function () {
    store.clearActions();
    jasmine.useRealClock();
  });

  it("should yield actions for initial values of config", function () {
    jasmine.Clock.tick(1000);
    const dispatchedActions = store.getActions();
    expect(dispatchedActions[0]).toEqual(A.changeListHeight(150));
    expect(dispatchedActions[1]).toEqual(A.changeRowHeight(20));
    expect(dispatchedActions[2]).toEqual(A.changeSortDirection("desc"));
    expect(dispatchedActions[3]).toEqual(A.changeSortField("$score"));
  });

  describe("when resized list action", function () {
    let listHeightSpy;

    beforeEach(function () {
      listHeightSpy = jasmine.createSpy("listHeight");
      atom.config.onDidChange("textual-velocity.listHeight", listHeightSpy);
      store.dispatch(A.resizeList(123));
      jasmine.Clock.tick(1000);
    });

    it("should have updated listHeight", function () {
      expect(atom.config.get("textual-velocity.listHeight")).toEqual(123);
    });

    it("should have yielded a last action", function () {
      const lastActions = store.getActions().slice(-2);
      expect(lastActions[0]).toEqual(A.resizeList(123));
      expect(lastActions[1]).toEqual(A.changeListHeight(123));
    });
  });

  describe("when changed row height", function () {
    let rowHeightSpy;

    beforeEach(function () {
      rowHeightSpy = jasmine.createSpy("rowHeight");
      atom.config.onDidChange("textual-velocity.rowHeight", rowHeightSpy);
      store.dispatch(A.changeRowHeight(26));
      jasmine.Clock.tick(1000);
    });

    it("should have updated rowHeight", function () {
      expect(atom.config.get("textual-velocity.rowHeight")).toEqual(26);
    });

    it("should have yielded a last action", function () {
      const lastActions = store.getActions().slice(-1);
      expect(lastActions[0]).toEqual(A.changeRowHeight(26));
    });
  });
});
