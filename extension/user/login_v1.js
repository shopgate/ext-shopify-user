const CryptoJS = require('crypto-js')
const SGShopifyApi = require('../lib/shopify.api.class.js')
const Login = require('../models/user/login')
const InvalidCallError = require('../models/Errors/InvalidCallError')

module.exports = async function (context, input, cb) {
  // strategy is not supported
  if (!Login.isStrategyValid(input.strategy)) {
    throw new InvalidCallError(`Invalid call: Authentication strategy: '${input.strategy}' not supported`)
  }

  const shopify = new SGShopifyApi(context)
  const storefrontAccessToken = await shopify.getStoreFrontAccessToken()

  const login = new Login(input.strategy)
  login.parameters = { customerId: input.parameters.customerId || null }

  switch (input.strategy) {
    case 'basic':
      login.login = input.parameters.login
      login.password = input.parameters.password

      return shopify.checkCredentials(shopify, storefrontAccessToken, login, input)
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

      return shopify.checkCredentials(shopify, storefrontAccessToken, login, input)
  }
}
