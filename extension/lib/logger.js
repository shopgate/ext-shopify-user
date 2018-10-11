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
    this.logger.debug({
      duration: response.elapsedTime || 'Not measured.',
      statusCode: response.statusCode || 0,
      /*
      request: requestOptions,
      */
      response: {
        //        headers: response.headers,
        body: response.body
      },
      message: 'Request to Shopify - User extension'
    })
  }
}
