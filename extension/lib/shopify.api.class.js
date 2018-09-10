const ShopifyRequest = require('./shopify.request')
const Tools = require('./tools')
const UnknownError = require('../models/Errors/UnknownError')
const FieldValidationError = require('../models/Errors/FieldValidationError')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const InvalidCallError = require('../models/Errors/InvalidCallError')

/**
 * Class for communication with ShopifyAPI. A wrapper for the shopify-node-api.
 */
class SGShopifyApi {
  constructor (context) {
    this.context = context
    this.shop = this.context.config.shopifyShopAlias + '.myshopify.com'
    this.shopifyApiKey = null // not required
    this.accessToken = this.context.config.shopifyAccessToken
    this.verbose = false

    this.shopifyApiRequest = new ShopifyRequest({
      shop: this.shop,
      shopify_api_key: this.shopifyApiKey, // not required
      access_token: this.accessToken, // not required
      verbose: this.verbose
    },
    context.log
    )
  }

  /**
   * @param {string} customerId
   * @param {ShopifyAddress} address
   * @returns {Promise.<{success:boolean}|FieldValidationError>}
   */
  async addAddress (customerId, address) {
    try {
      const response = await this.postRequest(`/admin/customers/${customerId}/addresses.json`, { address })
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
      const response = await this.getRequest(`/admin/customers/${customerId}/addresses.json?limit=250`, {})
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
      response = await this.putRequest(`/admin/customers/${customerId}/addresses/${addressId}/default.json`, {})
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
      await this.putRequest(`/admin/customers/${customerId}/addresses/${address.id}.json`, { address })
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
      await this.putRequest(`/admin/customers/${customerId}/addresses/set.json?address_ids[]=${addressIds.join('&address_ids[]=')}&operation=destroy`, {})
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
    const response = await this.getRequest(endpoint, {})
    const storefrontAccessTokenTitle = 'Web Checkout Storefront Access Token'

    if (!Tools.propertyExists(response, 'storefront_access_tokens')) {
      throw new Error('Invalid response from Shopify API.')
    }

    const token = response.storefront_access_tokens.find(token => token.title === storefrontAccessTokenTitle)
    if (typeof token !== 'undefined') {
      return token
    }

    // create a new access token, because no valid token was found at this point
    return (await this.postRequest(endpoint, {
      storefront_access_token: {
        title: storefrontAccessTokenTitle
      }
    })).storefront_access_token.access_token
  }

  /**
   * @param cb
   */
  createCheckout (cb) {
    this.postRequest('/admin/checkouts.json', {})
      .then(response => cb(null, response))
      .catch(err => cb(err))
  }

  /**
   * @param checkoutToken
   * @param cb
   * @returns {function} cb
   */
  getCheckout (checkoutToken, cb) {
    this.getRequest('/admin/checkouts/' + checkoutToken + '.json', {})
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

    this.putRequest('/admin/checkouts/' + checkoutToken + '.json', data)
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

    this.putRequest('/admin/checkouts/' + checkoutToken + '.json', data)
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
    this.getRequest(`/admin/customers/${customersId}.json`, {})
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
    this.getRequest(`/admin/customers/search.json?query=email:"${email}"&fields=id,email&limit=5`, {})
      .then(userData => {
        if (Tools.isEmpty(userData.customers)) {
          return cb(new Error('Customer not found'))
        }

        return cb(null, userData.customers)
      })
      .catch(err => cb(err))
  }

  /**
   * @param endpoint
   * @param params
   */
  async getRequest (endpoint, params) {
    return this.shopifyApiRequest.get(endpoint, params)
  }

  /**
   * @param endpoint
   * @param params
   */
  async putRequest (endpoint, params) {
    return this.shopifyApiRequest.put(endpoint, params)
  }

  /**
   * @param endpoint
   * @param params
   */
  async deleteRequest (endpoint, params) {
    return this.shopifyApiRequest.delete(endpoint, params)
  }

  /**
   * @param endpoint
   * @param params
   */
  async postRequest (endpoint, params) {
    return this.shopifyApiRequest.post(endpoint, params)
  }
}

module.exports = SGShopifyApi
