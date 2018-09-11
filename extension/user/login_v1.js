const CryptoJS = require('crypto-js')
const ApiFactory = require('../lib/shopify.api.factory')
const Login = require('../models/user/login')
const InvalidCallError = require('../models/Errors/InvalidCallError')

module.exports = async function (context, input) {
  // strategy is not supported
  if (!Login.isStrategyValid(input.strategy)) {
    throw new InvalidCallError(`Invalid call: Authentication strategy: '${input.strategy}' not supported`)
  }

  // TODO move to some kind of token manager class or function
  let storefrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  if (!storefrontAccessToken) {
    const adminApi = ApiFactory.buildAdminApi(context)
    storefrontAccessToken = (await adminApi.getStoreFrontAccessToken()).access_token
    context.storage.extension.set('storefrontAccessToken', storefrontAccessToken)
  }

  const storefrontApi = ApiFactory.buildStorefrontApi(context, storefrontAccessToken)
  const login = new Login(input.strategy)
  login.parameters = { customerId: input.parameters.customerId || null }

  let customerAccessToken
  switch (input.strategy) {
    case 'basic':
      login.login = input.parameters.login
      login.password = input.parameters.password

      customerAccessToken = await storefrontApi.getCustomerAccessToken(login, input.authType)
      break
    case 'web':
      const phrase = await context.storage.device.get('webLoginPhrase')

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

      customerAccessToken = storefrontApi.getCustomerAccessToken(login, input)
      break
  }

  return {
    login: {
      login: input.parameters.login,
      parameters: input.parameters
    },
    customerAccessToken,
    storefrontAccessToken
  }
}
