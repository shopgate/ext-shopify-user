const CryptoJS = require('crypto-js')
const ApiFactory = require('../lib/ShopifyApiFactory')
const InvalidCallError = require('../models/Errors/InvalidCallError')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.strategy
 * @param {Object} input.parameters
 * @param {Object} input.parameters.login
 * @param {string} input.parameters.login.login The customer's login (i.e. email address) when using strategy "basic".
 * @param {Object} input.parameters.login.password The customer's password when using strategy "basic".
 * @param {string} input.parameters.customerId The customer's ID sent by app when using strategy "web".
 * @param {string} input.parameters.payload Encrypted login data sent by app when using strategy "web".
 * @returns {Promise<{customerAccessToken: string, storefrontAccessToken: string, [customerId]: string}>}
 */
module.exports = async (context, input) => {
  // strategy is not supported
  if (!['basic', 'web', 'facebook', 'twitter', 'shopifyNewCustomerAccounts'].includes(input.strategy)) {
    throw new InvalidCallError(`Invalid call: Authentication strategy: '${input.strategy}' not supported`)
  }

  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  let customerAccessToken
  switch (input.strategy) {
    case 'basic':
      customerAccessToken = await storefrontApi.getCustomerAccessToken(input.parameters.login, input.parameters.password)
      break

    case 'shopifyNewCustomerAccounts': {
      const authorization = JSON.parse(await context.storage.device.get('headlessAuthorizationPayload'))
      // todo: check "state" and "nonce"
      const headlessAuthApi = ApiFactory.buildHeadlessAuthApi(context)
      const accessToken = await headlessAuthApi.getAccessToken(authorization.code)
      const customerAccountAccessToken = await headlessAuthApi.exchangeAccessToken(accessToken.access_token)

      const customerAccountsApi = ApiFactory.buildCustomerAccountApi(context)
      customerAccessToken = await customerAccountsApi.getCustomerAccessToken(customerAccountAccessToken)
      break
    }

    case 'web': {
      const phrase = await context.storage.device.get('webLoginPhrase')

      /** @type {Buffer} */
      const decryptedData = CryptoJS.AES.decrypt(input.parameters.payload, phrase)
      const decodedPayload = decryptedData.toString(CryptoJS.enc.Utf8)

      /** @type {{u: string, p: string}} */
      const userData = JSON.parse(decodedPayload)
      customerAccessToken = await storefrontApi.getCustomerAccessToken(userData.u, userData.p)
      break
    }
  }

  return {
    customerAccessToken,
    customerId: input.parameters.customerId
  }
}
