const Tools = require('./tools')
const UnknownError = require('../models/Errors/UnknownError')
const FieldValidationError = require('../models/Errors/FieldValidationError')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const jsonb = require('json-bigint')
const requestp = require('request-promise-native')

module.exports = class {
  /**
   * @param {string} shopAlias
   * @param {string} accessToken
   * @param {Function} requestLog
   */
  constructor (shopAlias, accessToken, requestLog) {
    this.shop = shopAlias + '.myshopify.com'
    this.accessToken = accessToken
    this.requestLog = requestLog
  }

  /**
   * @param {string} customerId
   * @param {ShopifyAddress} address
   * @returns {Promise.<{success:boolean}|FieldValidationError>}
   */
  async addAddress (customerId, address) {
    try {
      const response = await this.post(`/admin/customers/${customerId}/addresses.json`, { address })
      return { id: response.customer_address.id }
    } catch (err) {
      if (err) {
        // Some Shopify address validation error occurred
        if (err.code === 422) {
          const validationError = new FieldValidationError()
          for (let fieldName in err.error) {
            err.error[fieldName].forEach(message => {
              validationError.addValidationMessage(fieldName, message, address[fieldName])
            })
          }
          throw validationError
        }

        throw err
      }
    }
  }

  /**
   * Get up to 250 addresses of the customer
   * @param {string} customerId
   * @returns {Promise.<ShopifyAddress[]>}
   * @throws UnknownError
   * @throws CustomerNotFoundError
   */
  async getAddresses (customerId) {
    try {
      const response = await this.get(`/admin/customers/${customerId}/addresses.json`, `limit=250`)
      return response.addresses
    } catch (err) {
      if (err.code === 404) {
        throw new CustomerNotFoundError()
      }
      throw new UnknownError()
    }
  }

  /**
   * @param {number} customerId
   * @param {number|string} addressId
   * @returns {Promise.<{success:boolean}>}
   */
  async setDefaultAddress (customerId, addressId) {
    let response

    try {
      response = await this.put(`/admin/customers/${customerId}/addresses/${addressId}/default.json`)
    } catch (err) {
      if (err.code === 404) {
        throw new CustomerNotFoundError()
      }

      throw new UnknownError()
    }

    if (parseInt(response.customer_address.id) !== parseInt(addressId)) {
      throw new UnknownError()
    }

    return { success: true }
  }

  /**
   * @param {string} customerId
   * @param {ShopifyAddress} address
   * @returns {Promise.<{success:boolean}>}
   * @throws FieldValidationError
   * @throws UnknownError
   * @throws InvalidCallError
   */
  async updateAddress (customerId, address) {
    try {
      await this.put(`/admin/customers/${customerId}/addresses/${address.id}.json`, { address })
      return { success: true }
    } catch (err) {
      if (err.code === 404) {
        throw new InvalidCallError('Address not found')
      }

      // Some Shopify address validation error occurred
      if (err.code === 422) {
        const validationError = new FieldValidationError()
        for (let fieldName in err.error) {
          err.error[fieldName].forEach(message => {
            validationError.addValidationMessage(fieldName, message, address[fieldName])
          })
        }
        throw validationError
      }

      throw new UnknownError()
    }
  }

  /**
   * @param {string} customerId
   * @param {Array} addressIds
   * @returns {Promise.<{success:boolean}>}
   */
  async deleteAddresses (customerId, addressIds) {
    try {
      await this.put(
        `/admin/customers/${customerId}/addresses/set.json`,
        {},
        `address_ids[]=${addressIds.join('&address_ids[]=')}&operation=destroy`
      )
      return { success: true }
    } catch (err) {
      // Some Shopify address validation error occurred
      if (err.code === 422) {
        if (err.error.match(/Cannot remove address ids because the default address id \(.*\) was included/)) {
          throw new InvalidCallError('Cannot remove default address.')
        }
      }

      throw new UnknownError()
    }
  }

  /**
   * @returns {Promise<string>} The storefront access token.
   * @throws {Error} If the API returns an invalid response or an error occurs on the request.
   */
  async getStoreFrontAccessToken () {
    const endpoint = '/admin/storefront_access_tokens.json'
    const response = await this.get(endpoint)
    const storefrontAccessTokenTitle = 'Web Checkout Storefront Access Token'

    if (!Tools.propertyExists(response, 'storefront_access_tokens')) {
      throw new Error('Invalid response from Shopify API.')
    }

    const token = response.storefront_access_tokens.find(token => token.title === storefrontAccessTokenTitle)
    if (typeof token !== 'undefined') {
      return token
    }

    // create a new access token, because no valid token was found at this point
    return this.post(endpoint, {
      storefront_access_token: {
        title: storefrontAccessTokenTitle
      }
    })
  }

  /**
   * @param cb
   */
  createCheckout (cb) {
    this.post('/admin/checkouts.json')
      .then(response => cb(null, response))
      .catch(err => cb(err))
  }

  /**
   * @param checkoutToken
   * @param cb
   * @returns {function} cb
   */
  getCheckout (checkoutToken, cb) {
    this.get(`/admin/checkouts/${checkoutToken}.json`)
      .then(response => cb(null, response))
      .catch(err => cb(err))
  }

  /**
   * @param checkoutToken
   * @param productList
   * @param cb
   * @returns {function} cb
   */
  setCheckoutProducts (checkoutToken, productList, cb) {
    const data = {
      checkout: {
        line_items: productList
      }
    }

    this.put(`/admin/checkouts/${checkoutToken}.json`, data)
      .then(response => cb(null, response))
      .catch(err => cb(err))
  }

  /**
   * @param checkoutToken
   * @param discountCode
   * @param cb
   * @returns {function} cb
   */
  setCheckoutDiscount (checkoutToken, discountCode, cb) {
    const data = {
      checkout: {
        discount_code: discountCode
      }
    }

    this.put(`/admin/checkouts/${checkoutToken}.json`, data)
      .then(response => cb(null, response))
      .catch(err => cb(err))
  }

  /**
   * @typedef {Object} userData
   * @property {Object} customer
   * @property {Array} customers
   *
   * @param customersId
   * @param cb
   */
  getCustomerById (customersId, cb) {
    this.get(`/admin/customers/${customersId}.json`)
      .then(userData => {
        if (Tools.isEmpty(userData.customer)) {
          return cb(new Error('Customer not found'))
        }

        return cb(null, userData.customer)
      }).catch(err => cb(err))
  }

  /**
   * @param email
   * @param cb
   * @returns {function} cb
   */
  findUserByEmail (email, cb) {
    this.get('/admin/customers/search.json', `query=email:"${email}"&fields=id,email&limit=5`)
      .then(userData => {
        if (Tools.isEmpty(userData.customers)) {
          return cb(new Error('Customer not found'))
        }

        return cb(null, userData.customers)
      })
      .catch(err => cb(err))
  }

  /**
   * @param {string} endpoint
   * @param {string} query
   */
  async get (endpoint, query = '') {
    return this.request('GET', endpoint, query)
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @param {string} query
   */
  async post (endpoint, data = {}, query = '') {
    return this.request('POST', endpoint, query, data)
  }

  /**
   * @param {string} endpoint
   * @param {Object} data
   * @param {string} query
   */
  async put (endpoint, data = {}, query = '') {
    return this.request('PUT', endpoint, query, data)
  }

  /**
   * @param {string} endpoint
   * @param {string} query
   */
  async delete (endpoint, query) {
    return this.request('DELETE', endpoint, query)
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
      uri: `https://${this.shop.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}${!query ? '' : '?' + query}`,
      method: method.toLowerCase() || 'get',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
      response = await requestp({ ...options, time: true })
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
