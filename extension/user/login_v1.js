const request = require('request')
const CryptoJS = require('crypto-js')

const Tools = require('../lib/tools')
const Login = require('../models/user/login')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const UnknownError = require('../models/Errors/UnknownError')

module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)

  // strategy is not supported
  if (!Login.isStrategyValid(input.strategy)) {
    return cb(new InvalidCallError(`Invalid call: Authentication strategy: '${input.strategy}' not supported`))
  }

  Shopify.getStorefrontAccessToken((err, storefrontAccessToken) => {
    if (err) return cb(err)

    const login = new Login(input.strategy)

    switch (input.strategy) {
      case 'basic':
        login.login = input.parameters.login
        login.password = input.parameters.password

        checkCredentials(storefrontAccessToken, login, (err, userId) => {
          return cb(err, userId)
        })

        break
      case 'web':
        context.storage.device.get('webLoginPayload', (err, payload) => {
          if (err) return err

          const decodedPhrase = Buffer.from(payload, 'base64').toString('ascii')
          const decryptedData = CryptoJS.AES.decrypt(input.parameters.payload, decodedPhrase).toString(CryptoJS.enc.Utf8)
          const userData = JSON.parse(decryptedData)

          login.login = userData.u
          login.password = userData.p

          checkCredentials(storefrontAccessToken, login, (err, userId) => {
            console.log('userId: ' + JSON.stringify(userId))
            return cb(err, userId)
          })
        })

        break
    }
  })

  /**
   * @param {string} storefrontAccessToken
   * @param {Login} login
   * @param {function} cb
   */
  function checkCredentials (storefrontAccessToken, login, cb) {
    const requestData = createRequestData(login, storefrontAccessToken)

    // perform a request against the graphQL-API from Shopify to authenticate login-data
    request(requestData, function (err, response, body) {
      if (err) {
        context.log.error(input.authType + ': Auth step finished unsuccessfully.')
        return cb(new UnknownError())
      }
      /**
       * @typedef {object} token
       * @property {object} customerAccessTokenCreate
       * @property {string} customerAccessTokenCreate.userErrors
       */
      const token = body.data
      if (Tools.propertyExists(token, 'customerAccessTokenCreate.userErrors') &&
        !Tools.isEmpty(token.customerAccessTokenCreate.userErrors)) {
        return cb(new Error(token.customerAccessTokenCreate.userErrors[0].message))
      }

      // login successful
      cb(null, {userId: login.login})
    })
  }

  /**
   * @param {object} login
   * @param {string} storefrontAccessToken
   * @return {object}
   */
  function createRequestData (login, storefrontAccessToken) {
    return {
      method: 'POST',
      url: Shopify.getGraphQlUrl(),
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
