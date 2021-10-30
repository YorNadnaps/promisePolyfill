const promisePolyfill = require("./promisePolyfill");

describe("Then handler of promise should work properly", () => {
  test("Resolving promise with value passes the resolution value to its then-handler", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(9);
    });
    promise.then((value) => {
      try {
        expect(value).toBe(9);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  test("Passing a non-function value to then-handler should result in then-handler getting resolved with value of its parent promise", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(18);
    });
    promise
      .then(
        "I'm a non-function value. Ideally, I should be resolved with value of my parent promise"
      )
      .then((value) => {
        try {
          expect(value).toBe(18);
          done();
        } catch (error) {
          done(error);
        }
      });
  });

  test("Chaining works with then-handlers", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(9);
    });
    promise
      .then((value) => {
        try {
          expect(value).toBe(9);
        } catch (error) {
          done(error);
        }
        return value + 1;
      })
      .then((value) => {
        try {
          expect(value).toBe(10);
        } catch (error) {
          done(error);
        }
        return value + 2;
      })
      .then((value) => {
        try {
          expect(value).toBe(12);
          done();
        } catch (error) {
          done(error);
        }
      });
  });

  test("Promise should support multiple then handlers", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(9);
    });
    promise
      .then((value) => {
        try {
          expect(value).toBe(9);
        } catch (error) {
          done(error);
        }
        return value + 1;
      })
      .then((value) => {
        try {
          expect(value).toBe(10);
        } catch (error) {
          done(error);
        }
      });

    promise.then((value) => {
      try {
        expect(value).toBe(9);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  test("Resolution handler works when return value is promise", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(9);
    });

    promise
      .then((value) => {
        try {
          expect(value).toBe(9);
        } catch (error) {
          done(error);
        }
        return value + 1;
      })
      .then((value) => {
        try {
          expect(value).toBe(10);
        } catch (error) {
          done(error);
        }
        return new promisePolyfill((resolve, _reject) => {
          resolve(value + 2);
        });
      })
      .then((value) => {
        try {
          expect(value).toBe(12);
          done();
        } catch (error) {
          done(error);
        }
      });
  });

  test("Once promise is resolved, resolving it again with another value has no effect", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(9);
      resolve(18);
    });
    promise.then((value) => {
      try {
        expect(value).toBe(9);
      } catch (error) {
        done(error);
      }
      setTimeout(() => {
        promise.then((value) => {
          try {
            expect(value).toBe(9);
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });

  test("Promise can be resolved again once it has been resolved", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(9);
    });
    promise.then((value) => {
      try {
        expect(value).toBe(9);
      } catch (error) {
        done(error);
      }
      setTimeout(() => {
        promise.then((value) => {
          try {
            expect(value).toBe(9);
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });
});

describe("Catch handler of promise should work properly", () => {
  test("Rejecting promise with reason passed rejection reason to its catch-handler", (done) => {
    const promise = new promisePolyfill((_resolve, reject) => {
      reject("Error");
    });
    promise.catch((reason) => {
      try {
        expect(reason).toBe("Error");
      } catch (error) {
        done(error);
      }
      done();
    });
  });

  test("Passing a non-function value to catch-handler should result in catch-handler getting reject with reason of its parent promise", (done) => {
    const promise = new promisePolyfill((_resolve, reject) => {
      reject("Error");
    });
    promise
      .catch(
        "I'm a non-function value. Ideally, I should be rejected with value of my parent promise"
      )
      .catch((reason) => {
        try {
          expect(reason).toBe("Error");
        } catch (error) {
          done(error);
        }
        done();
      });
  });

  test("Chaining should work with catch-handlers", (done) => {
    const promise = new promisePolyfill((_resolve, reject) => {
      reject("Something went wrong");
    });
    promise
      .then((value) => {
        return value;
      })
      .catch((reason) => {
        try {
          expect(reason).toBe("Something went wrong");
          done();
        } catch (error) {
          done(error);
        }
      });
  });

  test("Promises that are rejected within then-handler should be cuaght in catch block", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve(27);
    });
    promise
      .then((value) => {
        try {
          expect(value).toBe(27);
        } catch (error) {
          done(error);
        }
        return new promisePolyfill((_resolve, reject) => {
          reject("Error");
        });
      })
      .catch((reason) => {
        try {
          expect(reason).toBe("Error");
          done();
        } catch (error) {
          done(error);
        }
      });
  });

  test("Catch-handler should catch error thrown in then-handler", (done) => {
    const promise = new promisePolyfill((resolve, _reject) => {
      resolve();
    });
    promise
      .then(() => {
        throw new Error("Something went wrong");
      })
      .catch((reason) => {
        try {
          expect(reason.message).toBe("Something went wrong");
          done();
        } catch (error) {
          done(error);
        }
      });
  });

  test("Catch-handler should catch error thrown in executor function", (done) => {
    const promise = new promisePolyfill(() => {
      throw new Error("Something went wrong");
    });
    promise
      .then(() => {
        return "There goes nothing!";
      })
      .catch((reason) => {
        try {
          expect(reason.message).toBe("Something went wrong");
          done();
        } catch (error) {
          done(error);
        }
      });
  });
});
