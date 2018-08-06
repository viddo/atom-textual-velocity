/* @flow */

import * as React from "react";
import ReactTestUtils from "react-dom/test-utils";
import CellEditor from "../../../lib/react/presentationals/CellEditor";
import dispatchKeyDownEvent from "../../../lib/dispatchKeydownEvent";

describe("react/presentationals/CellEditor", function() {
  let onSaveSpy, onAbortSpy;
  let component: any;

  beforeEach(function() {
    onSaveSpy = jasmine.createSpy("save");
    onAbortSpy = jasmine.createSpy("abort");
    component = ReactTestUtils.renderIntoDocument(
      <CellEditor initialVal="foo" onSave={onSaveSpy} onAbort={onAbortSpy} />
    );
  });

  it("renders an input with the initial value", function() {
    expect(component.input.type).toEqual("text");
    expect(component.input.value).toEqual("foo");
  });

  describe("when <enter>", function() {
    beforeEach(function() {
      dispatchKeyDownEvent(component.input, { keyCode: 13 });
    });

    it("aborts since value has not changed", function() {
      expect(onAbortSpy).toHaveBeenCalled();
      expect(onSaveSpy).not.toHaveBeenCalled();
    });
  });

  describe("when input is changed", function() {
    beforeEach(function() {
      component.input.value = " a b c ";
      ReactTestUtils.Simulate.change(component.input);
      dispatchKeyDownEvent(component.input, { keyCode: 40 }); // <down>
    });

    it("gets the changed value", function() {
      expect(component.input.value).toEqual(" a b c ");
    });

    it("does not call save or abort", function() {
      expect(onSaveSpy).not.toHaveBeenCalled();
      expect(onAbortSpy).not.toHaveBeenCalled();
    });

    describe("when <enter>", function() {
      beforeEach(function() {
        dispatchKeyDownEvent(component.input, { keyCode: 13 });
      });

      it("saves the changed value", function() {
        expect(onSaveSpy).toHaveBeenCalled();
        expect(onSaveSpy).toHaveBeenCalledWith("a b c");
        expect(onAbortSpy).not.toHaveBeenCalled();
      });
    });

    describe("when <esc>", function() {
      beforeEach(function() {
        dispatchKeyDownEvent(component.input, { keyCode: 27 });
      });

      it("aborts", function() {
        expect(onAbortSpy).toHaveBeenCalled();
        expect(onSaveSpy).not.toHaveBeenCalled();
      });
    });
  });
});
