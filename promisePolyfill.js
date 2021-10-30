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
  /**
   * Promise's executor function.
   * @param {*} executor Contructor function of promise.
   */
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
      } catch (error) {
        this._reject(error);
      }
    });
  }

  /**
   * Implementation of resolution function.
   * @param {*} value Value with which we resolve promise.
   */
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
        let rV;
        try {
          rV = resolutionHandler(this._value);
        } catch (error) {
          promise._reject(error);
        }
        /**
         * Check if return value is a promise (thenable).
         */
        if (rV && typeof rV.then === "function") {
          rV.then((value) => {
            promise._resolve(value);
          }).catch((reason) => {
            promise._reject(reason);
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

  /**
   * Implementation of then handler.
   * @param {*} resolutionHandler The callback to be executed when promise is resolved.
   * @returns A new promise which can be used for chaining.
   */
  then(resolutionHandler) {
    const promise = new promisePolyfill(() => {});
    this.thenQ.push({ resolutionHandler, promise });

    if (this.state === states.FULFILLED) {
      this.runResolutionHandler();
    }

    return promise;
  }

  /**
   * Implementation of rejection function.
   * @param {*} reason Reason with which we reject promise.
   */
  _reject(reason) {
    if (this.state === states.PENDING) {
      this._reason = reason;
      this.state = states.REJECTED;
      this.runRejectionHandler();

      /**
       * Reject existing handlers in then queue with rejection reason if promise has been rejected.
       */
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

  /**
   * Implementation of catch handler.
   * @param {*} rejectionHandler The callback to be executed when promise is rejected.
   * @returns A new promise which can be used for chaining.
   */
  catch(rejectionHandler) {
    const promise = new promisePolyfill(() => {});
    this.catchQ.push({ rejectionHandler, promise });

    if (this.state === states.REJECTED) {
      this.runRejectionHandler();
    }

    return promise;
  }
}

module.exports = promisePolyfill;
