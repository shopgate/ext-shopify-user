const request = require('request')

const Tools = require('../lib/tools')
const Message = require('../models/messages/message')
const Login = require('../models/user/login')
const UnknownError = require('../models/Errors/UnknownError')

module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  let messages = []

  /* Strategy is not supported */
  if (!Login.isValidStrategy(input.strategy)) {
    const message = new Message()
    message.addErrorMessage('no code', 'authentication-strategy: ' + input.strategy + ' no supported')
    messages.push(message.toJson())

    return cb(null, {
      messages: messages
    })
  }

  const login = new Login(input.strategy)

  function createRequestData () {
    return {
      method: 'POST',
      url: Shopify.getGraphQlUrl(),
      headers: {
        'cache-control': 'no-cache',
        'x-shopify-storefront-access-token': Shopify.getStorefrontAccessToken(),
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

  login.login = input.parameters.login
  login.password = input.parameters.password
  login.strategy = input.strategy

  const requestData = createRequestData()

  // Perform a request against the graphQL-API from Shopify to authenticate login-data
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
    if (Tools.isObjectDefined(token, 'customerAccessTokenCreate.userErrors') &&
      !Tools.objectIsEmpty(token.customerAccessTokenCreate.userErrors)) {
      return cb(new Error(token.customerAccessTokenCreate.userErrors[0].message))
    }

    // Login successful
    cb(null, {
      userId: login.login
    })
  })
}
