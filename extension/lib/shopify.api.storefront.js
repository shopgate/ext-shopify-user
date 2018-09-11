const Tools = require('./tools')
const requestp = require('request-promise-native')
const UnknownError = require('../models/Errors/UnknownError')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')

module.exports = class {
  /**
   * @param {string} shopAlias
   * @param {string} storefrontAccessToken
   * @param {Object} logger A generic logger instance, e.g. current step context's .log property.
   * @param {Function} requestLog A Shopify request log function as defined in ./logger.js
   */
  constructor (shopAlias, storefrontAccessToken, logger, requestLog) {
    this.apiUrl = `https://${shopAlias}.myshopify.com/api/graphql`
    this.storefrontAccessToken = storefrontAccessToken
    this.logger = logger
    this.requestLog = requestLog
  }

  /**
   * @param {Login} login
   * @param {string} authType
   * @return {Object} with properties "accessToken" (the actual token) and "expiresAt" (the expiry date of the cookie)
   */
  async getCustomerAccessToken (login, authType) {
    const query = 'mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) ' +
      '{customerAccessTokenCreate(input: $input) ' +
      '{userErrors {field message} customerAccessToken {accessToken expiresAt}}}'

    const variables = {
      input: {
        email: login.login,
        password: login.password
      }
    }

    const operationName = 'customerAccessTokenCreate'

    let response
    try {
      response = await this.request(query, variables, operationName)
    } catch (err) {
      this.logger.error(authType + ': Auth step finished unsuccessfully.', err)
      throw new UnknownError()
    }

    if (!response.body.data) {
      this.logger.error(`No token received for login credentials: ${variables.input.login} / XXXXXXXX`)
      throw new UnknownError()
    }

    if (Tools.propertyExists(response.body.data, 'customerAccessTokenCreate.userErrors') &&
      !Tools.isEmpty(response.body.data.customerAccessTokenCreate.userErrors)) {
      throw new Error(response.body.data.customerAccessTokenCreate.userErrors[0].message)
    }

    return response.body.data.customerAccessTokenCreate.customerAccessToken
  }

  /**
   * @param {string} customerAccessToken
   * @returns {Promise<Object>}
   */
  async getCustomerByAccessToken (customerAccessToken) {
    const response = await this.request(`query { customer(customerAccessToken: "${customerAccessToken}") { id email firstName lastName phone } }`)

    if (!response.body.data) {
      throw new UnknownError('Unknown error fetching customer data by customer access token.')
    }

    if (response.body.data.customer === null || response.statusCode === 403) {
      throw new CustomerNotFoundError()
    }

    return response.body.data.customer
  }

  /**
   * @param {string} query
   * @param {Object} variables
   * @param {string} operationName
   * @returns {Promise<Object>}
   */
  async request (query, variables = undefined, operationName = undefined) {
    const options = {
      method: 'POST',
      url: this.apiUrl,
      headers: {
        'cache-control': 'no-cache',
        'x-shopify-storefront-access-token': this.storefrontAccessToken,
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: {
        query,
        variables,
        operationName
      },
      json: true,
      resolveWithFullResponse: true
    }

    const logOptions = JSON.parse(JSON.stringify(options))
    if (variables && variables.input && variables.input.password) {
      logOptions.body.variables.input.password = 'XXXXXXXX'
    }

    try {
      const response = await requestp(options)
      this.requestLog(logOptions, response)
      return response
    } catch (err) {
      this.requestLog(logOptions, null)
      throw err
    }
  }
}
