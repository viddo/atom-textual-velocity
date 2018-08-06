/* @flow */

// from https://github.com/atom/atom/blob/efae2e08c3f902149431732cbd550aea09748acc/spec/async-spec-helpers.js

export function beforeEach(fn: Function) {
  global.beforeEach(function() {
    const result = fn();
    if (result instanceof Promise) {
      waitsForPromise(() => result);
    }
  });
}

export function afterEach(fn: Function) {
  global.afterEach(function() {
    const result = fn();
    if (result instanceof Promise) {
      waitsForPromise(() => result);
    }
  });
}

export function it(desc: string, fn: Function) {
  global.it(desc, function() {
    const result = fn();
    if (result instanceof Promise) {
      waitsForPromise(() => result);
    }
  });
}

export function fit(desc: string, fn: Function) {
  global.fit(desc, function() {
    const result = fn();
    if (result instanceof Promise) {
      waitsForPromise(() => result);
    }
  });
}

export async function conditionPromise(condition: Function) {
  const startTime = Date.now();

  // eslint-disable-next-line
  while (true) {
    await timeoutPromise(100);

    if (await condition()) {
      return;
    }

    if (Date.now() - startTime > 5000) {
      throw new Error("Timed out waiting on condition");
    }
  }
}

export function timeoutPromise(timeout: number): Promise<*> {
  return new Promise(function(resolve) {
    global.setTimeout(resolve, timeout);
  });
}

function waitsForPromise(fn) {
  const promise = fn();
  global.waitsFor("spec promise to resolve", function(done) {
    promise.then(done, function(error) {
      jasmine.getEnv().currentSpec.fail(error);
      done();
    });
  });
}
