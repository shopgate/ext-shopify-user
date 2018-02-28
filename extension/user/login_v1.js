const request = require('request')
const CryptoJS = require('crypto-js')

const Tools = require('../lib/tools')
const Shopify = require('../lib/shopify.api.js')
const Login = require('../models/user/login')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const UnknownError = require('../models/Errors/UnknownError')

module.exports = function (context, input, cb) {
  // strategy is not supported
  if (!Login.isStrategyValid(input.strategy)) {
    return cb(new InvalidCallError(`Invalid call: Authentication strategy: '${input.strategy}' not supported`))
  }
  const shopify = Shopify(context.config)

  shopify.getStorefrontAccessToken((err, storefrontAccessToken) => {
    if (err) return cb(err)

    const login = new Login(input.strategy)

    switch (input.strategy) {
      case 'basic':
        login.login = input.parameters.login
        login.password = input.parameters.password

        checkCredentials(shopify, storefrontAccessToken, login, (err, checkCredentialsResponse) => {
          return cb(err, checkCredentialsResponse)
        })

        break
      case 'web':
        context.storage.device.get('webLoginPhrase', (err, phrase) => {
          if (err) return err

          /**
           * @typedef {Object} DecryptedStringData
           * @property {function(string|null|undefined):string} toString
           *
           * @type {DecryptedStringData}
           */
          const decryptedData = CryptoJS.AES.decrypt(input.parameters.payload, phrase)
          const decodedPayload = decryptedData.toString(CryptoJS.enc.Utf8)
          const userData = JSON.parse(decodedPayload)

          login.login = userData.u
          login.password = userData.p

          checkCredentials(shopify, storefrontAccessToken, login, (err, checkCredentialsResponse) => {
            return cb(err, checkCredentialsResponse)
          })
        })

        break
    }
  })

  /**
   * @param {Shopify} shopify
   * @param {string} storefrontAccessToken
   * @param {Login} login
   * @param {function} cb
   */
  function checkCredentials (shopify, storefrontAccessToken, login, cb) {
    const requestData = createRequestData(shopify, login, storefrontAccessToken)
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
      if (err) {
        context.log.error(input.authType + ': Auth step finished unsuccessfully.')
        return cb(new UnknownError())
      }

      const token = body.data
      if (Tools.propertyExists(token, 'customerAccessTokenCreate.userErrors') &&
        !Tools.isEmpty(token.customerAccessTokenCreate.userErrors)) {
        return cb(new Error(token.customerAccessTokenCreate.userErrors[0].message))
      }

      // login successful (pass on the storefront access token to avoid additional requests)
      cb(null, {
        login: login.login,
        customerAccessToken: token.customerAccessTokenCreate.customerAccessToken,
        storefrontAccessToken
      })
    })
  }

  /**
   * @param {Shopify} shopify
   * @param {object} login
   * @param {string} storefrontAccessToken
   * @return {object}
   */
  function createRequestData (shopify, login, storefrontAccessToken) {
    return {
      method: 'POST',
      url: shopify.getGraphQlUrl(),
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
}
