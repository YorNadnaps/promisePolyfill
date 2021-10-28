/**
 * An object depicting the various states of a promise.
 */
const states = {
  PENDING: "PENDING",
  FULFILLED: "FULFILLED",
  REJECTED: "REJECTED",
};

/**
 * A basic polyfill of JS promise.
 */
class promisePolyfill {
  constructor(executor) {
    /**
     * Set the initial state to pending until the promise is settled- fulfilled/rejected.
     */
    this.state = states.PENDING;

    /**
     * For dealing with then.
     */
    this.thenQ = [];
    this._value;

    /**
     * For dealing with catch.
     */
    this.catchQ = [];
    this._reason;

    /**
     * Need to ensure executor runs asynchronously as per JS promise spec.
     * So, we wrap it within setTimeout.
     */
    setTimeout(() => {
      try {
        executor(this._resolve.bind(this), this._reject.bind(this));
      } catch (exception) {}
    });
  }

  _resolve(value) {
    if (this.state === states.PENDING) {
      this._value = value;
      this.state = states.FULFILLED;
      this.runResolutionHandler();
    }
  }

  runResolutionHandler() {
    while (this.thenQ.length > 0) {
      const { resolutionHandler, promise } = this.thenQ.shift();
      if (typeof resolutionHandler === "function") {
        const rV = resolutionHandler(this._value);
        /**
         * Check if return value is a promise (thenable).
         */
        if (rV && typeof rV.then === "function") {
          rV.then((value) => {
            promise._resolve(value);
          });
        } else {
          promise._resolve(rV);
        }
      } else {
        /**
         * In case resolution handler is not a function, we should resolve it with the value passed to _resolve.
         */
        promise._resolve(this._value);
      }
    }
  }

  then(resolutionHandler) {
    const promise = new promisePolyfill(() => {});
    this.thenQ.push({ resolutionHandler, promise });

    if (this.state === states.FULFILLED) {
      this.runResolutionHandler();
    }

    return promise;
  }

  _reject(reason) {
    if (this.state === states.PENDING) {
      this._reason = reason;
      this.state = states.REJECTED;
      this.runRejectionHandler();

      while (this.thenQ.length > 0) {
        const { promise } = this.thenQ.shift();
        promise._reject(this._reason);
      }
    }
  }

  runRejectionHandler() {
    while (this.catchQ.length > 0) {
      const { rejectionHandler, promise } = this.catchQ.shift();

      if (typeof rejectionHandler === "function") {
        const rV = rejectionHandler(this._reason);
        /**
         * Check if return value is a promise (thenable).
         */
        if (rV && typeof rV.then === "function") {
          rV.then((value) => {
            promise._resolve(value);
          });
        } else {
          promise._resolve(rV);
        }
      } else {
        /**
         * In case rejection handler is not a function, we should reject it with the value passed to _reject.
         */
        promise._reject(this._reason);
      }
    }
  }

  catch(rejectionHandler) {
    const promise = new promisePolyfill(() => {});
    this.catchQ.push({ rejectionHandler, promise });

    if (this.state === states.REJECTED) {
      this.runRejectionHandler();
    }

    return promise;
  }
}

/**
 * Test case: for catch block in promise.
 */
/**
  const catchPromise = new promisePolyfill((res, rej) => {
    rej("Something went wrong!");
  });
  catchPromise
    .then(() => {
      console.log("Hey!");
    })
    .catch((reason) => {
      console.log(reason);
      setTimeout(() => {
        catchPromise.catch((reason) => {
          console.log(reason);
        });
      });
    });

  catchPromise.then(() => {
    console.log("Yo");
  });
*/

/**
 * Test case: Once promise is resolved, resolving it again with another value has no effect.
 */
/**
  const promise = new promisePolyfill((res) => {
    res(27);
    res(36);
  });
  promise.then((value) => {
    console.log(value);
    setTimeout(() => {
      promise.then((value) => {
        console.log(value);
      });
    });
  });
*/

/**
 * Test case: promise should be able to be resolved after it has been resolved.
 * Resolving a promise after it has been resolved should resolve it instantly with the value it had been resolved earlier.
 */
/**
  const promise = new promisePolyfill((res) => {
    res(9);
  });
  promise.then((value) => {
    console.log(value);
    setTimeout(() => {
      promise.then((value) => {
        console.log(value);
      });
    });
  });
*/
