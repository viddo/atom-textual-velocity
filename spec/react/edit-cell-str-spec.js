/* @flow */

import React from "react";
import ReactTestUtils from "react-dom/test-utils";
import EditCellStr from "../../lib/react/edit-cell-str";
import dispatchKeyDownEvent from "../dispatch-keydown-event";

describe("react/edit-cell-str", function() {
  let saveSpy, abortSpy;
  let component, input;

  beforeEach(function() {
    saveSpy = jasmine.createSpy("save");
    abortSpy = jasmine.createSpy("abort");
    component = ReactTestUtils.renderIntoDocument(
      <EditCellStr initialVal="foo" save={saveSpy} abort={abortSpy} />
    );
    input = component.input;
  });

  it("renders an input with the initial value", function() {
    expect(component.input.type).toEqual("text");
    expect(component.input.value).toEqual("foo");
  });

  describe("when <enter>", function() {
    beforeEach(function() {
      dispatchKeyDownEvent(input, { keyCode: 13 });
    });

    it("aborts since value has not changed", function() {
      expect(abortSpy).toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe("when input is changed", function() {
    beforeEach(function() {
      component.input.value = " a b c ";
      ReactTestUtils.Simulate.change(input);
      dispatchKeyDownEvent(input, { keyCode: 40 }); // <down>
    });

    it("gets the changed value", function() {
      expect(component.input.value).toEqual(" a b c ");
    });

    it("does not call save or abort", function() {
      expect(saveSpy).not.toHaveBeenCalled();
      expect(abortSpy).not.toHaveBeenCalled();
    });

    describe("when <enter>", function() {
      beforeEach(function() {
        dispatchKeyDownEvent(input, { keyCode: 13 });
      });

      it("saves the changed value", function() {
        expect(saveSpy).toHaveBeenCalled();
        expect(saveSpy).toHaveBeenCalledWith("a b c");
        expect(abortSpy).not.toHaveBeenCalled();
      });
    });

    describe("when <esc>", function() {
      beforeEach(function() {
        dispatchKeyDownEvent(input, { keyCode: 27 });
      });

      it("aborts", function() {
        expect(abortSpy).toHaveBeenCalled();
        expect(saveSpy).not.toHaveBeenCalled();
      });
    });
  });
});
