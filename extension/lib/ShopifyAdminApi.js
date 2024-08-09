const jsonb = require('json-bigint-native')
const request = require('request-promise-native')

class ShopifyAdminApi {
  /**
   * @param {string} shopUrl
   * @param {string} accessToken
   * @param {Function} requestLog
   * @param {string?} apiVersion
   */
  constructor (shopUrl, accessToken, requestLog, apiVersion = '2023-10') {
    this.apiUrl = `${shopUrl.replace(/\/+$/, '')}/admin/api/${apiVersion}/`
    this.accessToken = accessToken
    this.requestLog = requestLog
  }

  /**
   * @param {string} title The title that identifies the token at Shopify.
   * @returns {Promise<string>} The storefront access token.
   * @throws {Error} If the API returns an invalid response or an error occurs on the request.
   */
  async getStoreFrontAccessToken (title) {
    const endpoint = 'storefront_access_tokens.json'
    const response = await this.request('get', endpoint)

    if (!Object.hasOwnProperty.call(response, 'storefront_access_tokens')) {
      throw new Error('Invalid response from Shopify API.')
    }

    const token = response.storefront_access_tokens.find(token => token.title === title)
    if (typeof token !== 'undefined') {
      return token
    }

    // create a new access token, because no valid token was found at this point
    return this.request('post', endpoint, '', { storefront_access_token: { title } })
  }

  /**
   * @param {string} method
   * @param {string} endpoint
   * @param {string} query
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   * @throws when request fails or response is empty
   */
  async request (method, endpoint, query = '', data = {}) {
    const options = {
      uri: `${this.apiUrl}${endpoint.replace(/^\/+/, '')}${!query ? '' : '?' + query}`,
      method: method.toLowerCase() || 'get',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      simple: false,
      resolveWithFullResponse: true
    }

    if (data && Object.keys(data).length) {
      options.body = jsonb.stringify(data)
    }

    if (this.accessToken) {
      options.headers['X-Shopify-Access-Token'] = this.accessToken
    }

    let response
    try {
      response = await request({ ...options, time: true })
    } catch (err) {
      this.requestLog(options, {})
      throw err
    }
    this.requestLog(options, response)

    if (response.body.trim() === '') throw new Error('Empty response body.')

    const body = jsonb.parse(response.body)

    if (response.statusCode >= 400) {
      const error = new Error('Received non-2xx or -3xx HTTP status code.')
      error.code = response.statusCode
      error.error = body.error_description || body.error || body.errors || response.statusMessage
      throw error
    }

    return body
  }
}

module.exports = ShopifyAdminApi
