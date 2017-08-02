const Tools = require('../lib/tools')
const Message = require('../models/messages/message')
const Login = require('../models/user/login')
const request = require('request')

module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  let success = true
  let messages = []

  if (!Login.isValidStrategy(input.strategy)) {
    success = false
    const message = new Message()
    message.addErrorMessage('no code', 'authentication-strategy: ' + input.strategy + ' no supported')
    messages.push(message.toJson())
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
        query: 'mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {customerAccessTokenCreate(input: $input) {userErrors {field message} customerAccessToken {accessToken expiresAt}}}',
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
   * @typedef {Array|string} errorMessage
   *
   * @param code
   * @param errorMessage
   */
  function addErrorMessage (code, errorMessage) {
    let messageText = ''

    if (Array.isArray(errorMessage)) {
      messageText = errorMessage[0].message
    } else {
      messageText = errorMessage.message
    }

    const message = new Message()
    message.addErrorMessage(code, messageText)
    messages.push(message.toJson())
  }

  if (success) {
    login.login = input.parameters.login
    login.password = input.parameters.password
    login.strategy = input.strategy

    const requestData = createRequestData()

    /* Perform a request against the graphQL-API from Shopify to authenticate login-data */
    request(requestData, function (err, response, body) {
      if (err) {
        success = false
        addErrorMessage('error', err)
      }

      /**
       * @typedef {object} token
       * @property {object} customerAccessTokenCreate
       * @property {string} customerAccessTokenCreate.userErrors
       */
      let token = body.data

      /* Catch authentication errors here */
      if (!Tools.objectIsEmpty(token.customerAccessTokenCreate.userErrors)) {
        success = false
        addErrorMessage('error', token.customerAccessTokenCreate.userErrors)
      }

      if (success) {
        let userErrors = token.customerAccessTokenCreate.userErrors

        if (Tools.objectIsEmpty(userErrors)) {
          if (success) {
            const message = new Message()
            message.addSuccessMessage('success', 'successful')
            messages.push(message.toJson())
          }
        }
      }

      /* Change the values of success to "ok" to be able to use the conditionals-step within the pipeline */
      if (success) {
        success = 'ok'
        cb(null, {
          success: success,
          messages: messages,
          userId: login.login
        })
      } else {
        /* Login was not successful */
        cb(null, {
          messages: messages
        })
      }
    })
  } else {
    /* Strategy is not supported */
    cb(null, {
      messages: messages
    })
  }
}
