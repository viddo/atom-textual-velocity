/* @flow */

import observeAtomObj from "../lib/observeAtomObj";

describe("observeAtomObj", function() {
  describe("given valid input", function() {
    let observation$;
    let nextSpy, errorSpy;
    let subscription: rxjs$ISubscription;

    beforeEach(function() {
      atom.config.set("textual-velocity.path", "/notes");

      nextSpy = jasmine.createSpy("next");
      errorSpy = jasmine.createSpy("error");

      observation$ = observeAtomObj(atom.config, "observe", [
        "textual-velocity.path"
      ]);
      subscription = observation$.subscribe(nextSpy, errorSpy);
    });

    afterEach(function() {
      subscription.unsubscribe();
    });

    it("should be called when subscribed", function() {
      expect(nextSpy).toHaveBeenCalledWith("/notes");
      expect(nextSpy.calls.length).toEqual(1);
    });

    it("should call observer when observed object changed", function() {
      nextSpy.reset();
      atom.config.set("textual-velocity.path", "/other/dir");
      expect(nextSpy).toHaveBeenCalledWith("/other/dir");
      expect(nextSpy.calls.length).toEqual(1);
    });

    it("should be an observable", function() {
      expect(observation$.pipe).toEqual(jasmine.any(Function));
    });

    describe("when unsubscribed", function() {
      beforeEach(function() {
        subscription.unsubscribe();
        nextSpy.reset();
      });

      it("should no longer observe changes when unsubscribed", function() {
        atom.config.set("textual-velocity.path", "/other/dir");
        expect(nextSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe("given invalid key", function() {
    it("should throw error", function() {
      expect(() => observeAtomObj(atom.config, " ")).toThrow();
    });
  });
});
