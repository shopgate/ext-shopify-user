const querystring = require('querystring')
const BigJSON = require('json-bigint')
const https = require('https')
const request = require('request-promise-native')
const Logger = require('./logger')

module.exports = class {
  /**
   * @param {Object} config
   * @param {context.log} logger
   */
  constructor(config, logger) {
    this.config = config
    this.logger = new Logger(logger)
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  get(endpoint, data) {
    endpoint += '?' + querystring.stringify(data)
    return (this.makeRequest(endpoint, 'GET', data))
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  put(endpoint, data) {
    return (this.makeRequest(endpoint, 'PUT', data))
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  post(endpoint, data) {
    return (this.makeRequest(endpoint, 'POST', data))
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  delete(endpoint, data) {
    return (this.makeRequest(endpoint, 'DELETE', data))
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  patch(endpoint, data) {
    return (this.makeRequest(endpoint, 'PATCH', data))
  }

  /**
   * @param {string} endpoint
   * @param {string} method
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   * @throws when request fails or response is empty
   */
  async makeRequest(endpoint, method, data) {
    const options = {
      uri: 'https://' + this.config.shop.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, ''),
      method: method.toLowerCase() || 'get',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      agent: this.config.agent,
      simple: false,
      resolveWithFullResponse: true
    }

    if (data && Object.keys(data).length) {
      options.body = BigJSON.stringify(data)
    }

    if (this.config.access_token) {
      options.headers['X-Shopify-Access-Token'] = this.config.access_token
    }

    const response = await request({...options, time: true});
    this.logger.log(options, response)

    if (response.body.trim() === '') throw new Error('Empty response body.')

    const body = BigJSON.parse(response.body)
    if (response.statusCode >= 400) {
      const error = new Error('Received non-2xx or -3xx HTTP status code.')
      error.code = response.statusCode
      error.error = body.error_description || body.error || body.errors || response.statusMessage
      throw error
    }

    return body
  }

  /**
   * @param {Object} options
   * @returns {Boolean}
   */
  isGetMethod(options) {
    return options.method === 'get'
  }
}
