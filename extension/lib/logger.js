module.exports = class {
  /**
   * @param logger The extension's context.log object.
   */
  constructor (logger) {
    this.logger = logger
  }

  /**
   * @param {object} requestOptions
   * @param {object} response A response object of the "request" module
   */
  log (requestOptions, response) {
    if (!response.elapsedTime) response.elapsedTime = 'Not measured.'

    this.logger.debug({
      duration: response.elapsedTime,
      statusCode: response.statusCode,
      request: requestOptions,
      response: {
        headers: response.headers,
        body: response.body
      },
      message: 'Request to Shopify - User extension'
    })
  }
}
