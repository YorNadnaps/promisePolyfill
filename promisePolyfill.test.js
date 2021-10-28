const { expect } = require("@jest/globals");
const promisePolyfill = require("./promisePolyfill");

describe("Then handler of promise should work properly", () => {
  test("Resolving promise with value passes the resolution value to its then-handler", () => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(9);
    });
    promise.then((value) => {
      expect(value).toBe(9);
    });
  });

  test("Passing a non-function value to then-handler should result in then-handler getting resolved with value of its parent promise", () => {
    const promise = new promisePolyfill((res) => {
      resolve(9);
    });
    promise
      .then("I am a non-function handler. Ideally, I should be skipped")
      .then((value) => {
        expect(value).toBe(9);
      });
  });

  test("Chaining works with then-handlers", () => {
    const promise = new promisePolyfill((res) => {
      res(9);
    });
    promise
      .then((value) => {
        expect(value).toBe(9);
        return value + 1;
      })
      .then((value) => {
        expect(value).toBe(10);
        return value + 2;
      })
      .then((value) => {
        expect(value).toBe(12);
      });
  });

  test("Promise should support multiple then handlers", () => {
    const promise = new promisePolyfill((res) => {
      res(9);
    });
    promise
      .then((value) => {
        expect(value).toBe(9);
        return value + 1;
      })
      .then((value) => {
        expect(value).toBe(10);
      });

    promise.then((value) => {
      expect(value).toBe(9);
    });
  });

  test("Resolution handler works when return value is promise", () => {
    const promise = new promisePolyfill((res) => {
      res(9);
    });

    promise
      .then((value) => {
        expect(value).toBe(9);
        return value + 1;
      })
      .then((value) => {
        expect(value).toBe(10);
        return new promisePolyfill((res) => {
          res(value + 2);
        });
      })
      .then((value) => {
        expect(value).toBe(12);
      });
  });

  test("Once promise is resolved, resolving it again with another value has no effect", () => {
    const promise = new promisePolyfill((res) => {
      res(9);
      res(18);
    });
    promise.then((value) => {
      expect(value).toBe(9);
      setTimeout(() => {
        promise.then((value) => {
          expect(value).toBe(9);
        });
      });
    });
  });

  test("Promise can be resolved again once it has been resolved", () => {
    const promise = new promisePolyfill((res) => {
      res(9);
    });
    promise.then((value) => {
      expect(value).toBe(9);
      setTimeout(() => {
        promise.then((value) => {
          expect(value).toBe(9);
        });
      });
    });
  });
});
