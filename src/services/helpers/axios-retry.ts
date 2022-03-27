export const timeoutErrorToString = (error) => {
  if (!error || !error.config) {
    return "Request timeout";
  }
  return `Request timeout on ${error.config.method} ${error.config.url}`;
};

export class ResourceTimeoutException extends Error {
  constructor(error) {
    super(timeoutErrorToString(error));
    if (error && error.response) {
      (this).data = error.response.data || {};
    }
    (this).code = "timeout";
  }
}

export const isTimeout = (err) => {
  return err && err.code === "timeout";
};

export const isResponseRetryable = (response) => {
  if (response.status !== 503) {
    return false;
  }
  return response.data && response.data.retryable === true;
};

export const checkOverallTimeout = (err, isTimeout) => {
  if (isTimeout) {
    throw new ResourceTimeoutException(err);
  }
};
/**
 * @typedef {Object} RetryOptionsType
 * @property {number} [maxAttempts] - max number of attempts (including the first). Default: 3
 * @property {number} [maxOverallTimeMs] - the overall operation time limit in ms (all attempts). Default: 60000
 * @property {boolean} [retryOnNetwork] - retry on Network error or not. Default: false
 * @property {number} [networkRepeatTimeoutMs] - timeout msec before the next retry if the Network error occurred. Default: 1000
 */

/**
 *
 * @param {Function} fn - retryable async callback
 * @param {RetryOptionsType} [options] - options
 * @returns {Promise<*>} - the Promise, resolved into result of the callback
 * @throws ResourceTimeoutException - if options.maxAttempts exceeded or options.maxOverallTimeMs exceeded
 * @throws Axios error response object, if non-retryable error, refer {@link https://github.com/axios/axios#handling-errors}
 */
 export const axiosRetry = async (fn, options = {}) => {
  const opts = {
    maxAttempts: 3,
    maxOverallTimeMs: 60000,
    retryOnNetwork: false,
    networkRepeatTimeoutMs: 1000,
    ...options,
  };
  const startTime = Date.now();
  let lastError = null;
  for (let attempt = 1; attempt <= opts.maxAttempts; ++attempt) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isOverallTimeout = () => Date.now() - startTime > opts.maxOverallTimeMs;
      const response = err.response;

      // it maybe network error or AWS API Gateway timeout error, so it potentially retryable in some cases,
      // but it may be dangerous to retry POST or PUT requests without knowing whether the request is idempotent or no
      if (!response && opts.retryOnNetwork) {
        checkOverallTimeout(err, isOverallTimeout());
        await new Promise((resolve) => setTimeout(resolve, opts.networkRepeatTimeoutMs));
        checkOverallTimeout(err, isOverallTimeout());
        continue;
      }
      if (!response) {
        throw err;
      }

      if (isResponseRetryable(response)) {
        // check the overall operation timeout before new attempt
        checkOverallTimeout(err, isOverallTimeout());
        continue;
      }

      //its not retryable error, so throw it as is
      throw err;
    }
  }
  // after the last unsuccessful attempt just throw the last exception
  throw new ResourceTimeoutException(lastError);
};
