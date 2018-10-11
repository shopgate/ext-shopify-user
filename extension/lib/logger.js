module.exports = class {
  /**
   * @param {context.log} logger The extension's context.log object.
   */
  constructor (logger) {
    this.logger = logger
  }

  /**
   * @param {object} requestOptions
   * @param {object} response A response object of the "request" module
   */
  log (requestOptions, response = {}) {
    const logResponse = response === null ? {} : Object.assign({}, response)

    if (logResponse.body && typeof logResponse.body === 'object') {
      logResponse.body = JSON.stringify(logResponse.body)
    }

    this.logger.debug({
      duration: logResponse.elapsedTime || 'Not measured.',
      statusCode: logResponse.statusCode || 0,
      /* request: requestOptions, */
      response: {
        headers: logResponse.headers || {}
        // body: logResponse.body || ''
      },
      message: 'Request to Shopify - User extension'
    })
  }
}
