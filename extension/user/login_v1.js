const CryptoJS = require('crypto-js')
const SGShopifyApi = require('../lib/shopify.api.class.js')
const Login = require('../models/user/login')
const InvalidCallError = require('../models/Errors/InvalidCallError')

module.exports = function (context, input, cb) {
  // strategy is not supported
  if (!Login.isStrategyValid(input.strategy)) {
    return cb(new InvalidCallError(`Invalid call: Authentication strategy: '${input.strategy}' not supported`))
  }

  const shopify = new SGShopifyApi(context)

  shopify.getStoreFrontAccessToken((err, storefrontAccessToken) => {
    if (err) return cb(err)

    const login = new Login(input.strategy)
    login.parameters = { customerId: input.parameters.customerId || null }

    switch (input.strategy) {
      case 'basic':
        login.login = input.parameters.login
        login.password = input.parameters.password

        shopify.checkCredentials(shopify, storefrontAccessToken, login, input, (err, checkCredentialsResponse) => {
          return cb(err, checkCredentialsResponse)
        })
        break
      case 'web':
        context.storage.device.get('webLoginPhrase', (err, phrase) => {
          if (err) {
            return err
          }

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

          shopify.checkCredentials(shopify, storefrontAccessToken, login, input, (err, checkCredentialsResponse) => {
            return cb(err, checkCredentialsResponse)
          })
        })
        break
    }
  })
}
