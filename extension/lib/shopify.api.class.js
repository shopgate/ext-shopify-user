const ShopifyRequest = require('./shopify.request')
const Tools = require('./tools')
const UnknownError = require('../models/Errors/UnknownError')
const request = require('request')
const FieldValidationError = require('../models/Errors/FieldValidationError')
const Logger = require('./logger')

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
      await this.postRequest(`/admin/customers/${customerId}/addresses.json`, { address })
      return { success: true }
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
   * @returns {string}
   */
  getGraphQlUrl () {
    return 'https://' + this.shop + '/api/graphql'
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
      checkout: {
        discount_code: discountCode
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

  getCustomerByAccessToken (customerAccessToken) {
    const requestData = shopify.createRequestData(shopify, login, storefrontAccessToken)
    const logRequestData = JSON.parse(JSON.stringify(requestData))
    logRequestData.body.variables.input.password = 'customerAccessToken'
    const logRequest = new Logger(this.context.log)

    const lol = {
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
   * @param cb
   */
  putRequest (endpoint, params, cb) {
    this.shopifyApiRequest.put(endpoint, params)
      .then((response) => {
        cb(null, response)
      })
      .catch((err) => {
        cb(err)
      })
  }

  /**
   * @param endpoint
   * @param params
   * @param cb
   */
  deleteRequest (endpoint, params, cb) {
    this.shopifyApiRequest.delete(endpoint, params)
      .then((response) => {
        cb(null, response)
      })
      .catch((err) => {
        cb(err)
      })
  }

  /**
   * @param endpoint
   * @param params
   */
  async postRequest (endpoint, params) {
    return this.shopifyApiRequest.post(endpoint, params)
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
  checkCredentials (shopify, storefrontAccessToken, login, input, cb) {
    const requestData = shopify.createRequestData(shopify, login, storefrontAccessToken)
    const logRequestData = JSON.parse(JSON.stringify(requestData))
    logRequestData.body.variables.input.password = 'XXXXXXXX'
    const logRequest = new Logger(this.context.log)

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
    // TODO make this thing use request-promise-native
    request(requestData, (err, response, body) => {
      logRequest.log(logRequestData, response)

      if (err) {
        this.context.log.error(input.authType + ': Auth step finished unsuccessfully.')
        return cb(new UnknownError())
      }

      const token = body.data
      if (!token) {
        this.context.log.error('No token received for login credentials: ' + JSON.stringify(login))
        return cb(new UnknownError())
      }

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
