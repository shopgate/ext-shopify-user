const querystring = require('querystring')
const BigJSON = require('json-bigint')
const https = require('https')
const request = require('request-promise')
const Logger = require('./logger')

module.exports = class {
  /**
   * @param {Object} config
   * @param {context.log} logger
   */
  constructor (config, logger) {
    this.config = config
    this.logger = new Logger(logger)
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  get (endpoint, data) {
    endpoint += '?' + querystring.stringify(data)
    return (this.makeRequest(endpoint, 'GET', data))
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  put (endpoint, data) {
    return (this.makeRequest(endpoint, 'PUT', data))
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  post (endpoint, data) {
    return (this.makeRequest(endpoint, 'POST', data))
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  delete (endpoint, data) {
    return (this.makeRequest(endpoint, 'DELETE', data))
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   */
  patch (endpoint, data) {
    return (this.makeRequest(endpoint, 'PATCH', data))
  }

  /**
   * @param {string} endpoint
   * @param {string} method
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   * @throws when request fails or response is empty
   */
  async makeRequest (endpoint, method, data) {
    const options = {
      uri: this.config.shop.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, ''),
      method: method.toLowerCase() || 'get',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      agent: this.config.agent,
    }

    if (data) {
      options.body =  BigJSON.stringify(data)
    }

    if (this.config.access_token) {
      options.headers['X-Shopify-Access-Token'] = this.config.access_token
    }

    const response = await request({...options, time: true});
    this.logger.log(options, response)

    if (response.body.trim() === '') throw new Error('Empty response body.')

    return BigJSON.parse(response.body)
  }

  /**
   * @param {Object} options
   * @returns {Boolean}
   */
  isGetMethod (options) {
    return options.method === 'get'
  }
}
