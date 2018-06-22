const ShopifyAPI = require('shopify-node-api')
const Tools = require('./tools')
const UnknownError = require('../models/Errors/UnknownError')
const request = require('request')

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

    this.shopifyApi = ShopifyAPI({
      shop: this.shop,
      shopify_api_key: this.shopifyApiKey, // not required
      access_token: this.accessToken, // not required
      verbose: this.verbose
    })
  }

  /**
   * @returns {string}
   */
  getGraphQlUrl () {
    return 'https://' + this.shop + '/api/graphql'
  }

  /**
   * @param cb
   * @returns {function} cb
   */
  getStoreFrontAccessToken (cb) {
    const endpoint = '/admin/storefront_access_tokens.json'

    this.getRequest(endpoint, {}, (err, response) => {
      if (err) return cb(err)

      const storefrontAccessTokenTitle = 'Web Checkout Storefront Access Token'

      /**
       * @typedef {object} response
       * @property {storefront_access_token[]} storefront_access_tokens
       * @typedef {object} storefront_access_token
       * @property {string} access_token
       * @property {string} access_scope
       * @property {string} created_at
       * @property {int} id
       * @property {string} title
       */
      if (Tools.propertyExists(response, 'storefront_access_tokens')) {
        for (let token of response.storefront_access_tokens) {
          if (token.title === storefrontAccessTokenTitle) {
            return cb(null, token.access_token)
          }
        }
      }

      // create a new access token, because no valid token was found at this point
      const requestBody = {
        'storefront_access_token': {
          'title': storefrontAccessTokenTitle
        }
      }

      this.postRequest(endpoint, requestBody, (err, response) => {
        if (err) return cb(err)
        return cb(null, response.storefront_access_token.access_token)
      })
    })
  }

  /**
   * @param cb
   * @returns {function} cb
   */
  createCheckout (cb) {
    this.postRequest('/admin/checkouts.json', {}, function (err, response) {
      return cb(err, response)
    })
  }

  /**
   * @param checkoutToken
   * @param cb
   * @returns {function} cb
   */
  getCheckout (checkoutToken, cb) {
    this.getRequest('/admin/checkouts/' + checkoutToken + '.json', {}, function (err, response) {
      return cb(err, response)
    })
  }

  /**
   * @param checkoutToken
   * @param productList
   * @param cb
   * @returns {function} cb
   */
  setCheckoutProducts (checkoutToken, productList, cb) {
    const data = {
      'checkout': {
        'line_items': productList
      }
    }

    this.putRequest('/admin/checkouts/' + checkoutToken + '.json', data, (err, response) => {
      return cb(err, response)
    })
  }

  /**
   * @param checkoutToken
   * @param discountCode
   * @param cb
   * @returns {function} cb
   */
  setCheckoutDiscount (checkoutToken, discountCode, cb) {
    const data = {
      'checkout': {
        'discount_code': discountCode
      }
    }

    this.putRequest('/admin/checkouts/' + checkoutToken + '.json', data, (err, response) => {
      return cb(err, response)
    })
  }

  /**
   * @typedef {Object} userData
   * @property {Object} customer
   * @property {Array} customers
   *
   * @param customersId
   * @param cb
   * @returns {function} cb
   */
  getCustomerById (customersId, cb) {
    this.getRequest(`/admin/customers/${customersId}.json`, {}, (err, userData) => {
      if (err) {
        return cb(err)
      }

      if (Tools.isEmpty(userData.customer)) {
        return cb(new Error('Customer not found'))
      }

      cb(null, userData.customer)
    })
  }

  /**
   * @param email
   * @param cb
   * @returns {function} cb
   */
  findUserByEmail (email, cb) {
    this.getRequest(`/admin/customers/search.json?query=email:${email}&fields=id,email&limit=1`, {}, (err, userData) => {
      if (err) {
        return cb(err)
      }

      if (Tools.isEmpty(userData.customers)) {
        return cb(new Error('Customer not found'))
      }

      cb(null, userData.customers)
    })
  }

  /**
   * @param endpoint
   * @param params
   * @param cb
   */
  getRequest (endpoint, params, cb) {
    this.shopifyApi.get(endpoint, params, function (err, response) {
      cb(err, response)
    })
  }

  /**
   * @param endpoint
   * @param params
   * @param cb
   */
  putRequest (endpoint, params, cb) {
    this.shopifyApi.put(endpoint, params, function (err, response) {
      cb(err, response)
    })
  }

  /**
   * @param endpoint
   * @param params
   * @param cb
   */
  deleteRequest (endpoint, params, cb) {
    this.shopifyApi.delete(endpoint, params, function (err, response) {
      cb(err, response)
    })
  }

  /**
   * @param endpoint
   * @param params
   * @param cb
   */
  postRequest (endpoint, params, cb) {
    this.shopifyApi.post(endpoint, params, function (err, response) {
      cb(err, response)
    })
  }

  /**
   * @param {SGShopifyApi} shopify
   * @param {object} login
   * @param {string} storefrontAccessToken
   * @return {object}
   */
  createRequestData (shopify, login, storefrontAccessToken) {
    return {
      method: 'POST',
      url: this.getGraphQlUrl(),
      headers: {
        'cache-control': 'no-cache',
        'x-shopify-storefront-access-token': storefrontAccessToken,
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: {
        query: 'mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) ' +
          '{customerAccessTokenCreate(input: $input) ' +
          '{userErrors {field message} customerAccessToken {accessToken expiresAt}}}',
        variables: {
          input: {
            email: login.login,
            password: login.password
          }
        },
        operationName: 'customerAccessTokenCreate'
      },
      json: true
    }
  }

  /**
   * @param {SGShopifyApi} shopify
   * @param {string} storefrontAccessToken
   * @param {Login} login
   * @param {Object} input
   * @param {function} cb
   */
  checkCredentials (shopify, storefrontAccessToken, login, input, context, cb) {
    const requestData = shopify.createRequestData(shopify, login, storefrontAccessToken)

    /**
     * Perform a request against the graphQL-API from Shopify to authenticate using the users login credentials.
     *
     * @typedef {Object} ShopifyCustomerAccessToken
     * @property {string} accessToken
     * @property {string} expiresAt
     *
     * @typedef {Object} ShopifyCustomerAccessTokenCreate
     * @property {ShopifyCustomerAccessToken} customerAccessToken
     * @property {[Object]} userErrors
     *
     * @typedef {Object} ShopifyCustomerAccessTokenData
     * @property {ShopifyCustomerAccessTokenData} customerAccessTokenCreate
     *
     * @typedef {Object} ShopifyGraphQLResponseBody
     * @property {ShopifyCustomerAccessTokenData} data
     *
     * @param {Error} err
     * @param {Object} response
     * @param {ShopifyGraphQLResponseBody} body
     */
    request(requestData, (err, response, body) => {
      console.log(JSON.stringify(body))
      context.log.info('storefrontAccessToken: ' + JSON.stringify(storefrontAccessToken))
      context.log.info('response: ' + JSON.stringify(response))
      context.log.info('body.data: ' + JSON.stringify(body.data))
      if (err) {
        this.context.log.error(input.authType + ': Auth step finished unsuccessfully.')
        return cb(new UnknownError())
      }

      const token = body.data
      if (Tools.propertyExists(token, 'customerAccessTokenCreate.userErrors') &&
        !Tools.isEmpty(token.customerAccessTokenCreate.userErrors)) {
        return cb(new Error(token.customerAccessTokenCreate.userErrors[0].message))
      }

      // login successful (pass on the storefront access token to avoid additional requests)
      cb(null, {
        login: {
          login: login.login,
          parameters: login.parameters
        },
        customerAccessToken: token.customerAccessTokenCreate.customerAccessToken,
        storefrontAccessToken
      })
    })
  }
}

module.exports = SGShopifyApi
