/* @flow */

import Disposables from "../lib/Disposables";

const newFakeDisposable = () => {
  const spy = jasmine.createSpy("dispose");
  return {
    dispose: spy,
    disposed: () => true,
  };
};

describe("Disposables", () => {
  let disposables;

  beforeEach(() => {
    disposables = new Disposables();
  });

  describe(".add", () => {
    it("accepts multiple values", () => {
      const fake1 = newFakeDisposable();
      const fake2 = newFakeDisposable();
      disposables.add(fake1, fake2);
      disposables.dispose();
      expect(fake1.dispose).toHaveBeenCalled();
      expect(fake2.dispose).toHaveBeenCalled();
    });
  });
});
