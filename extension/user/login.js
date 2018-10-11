const CryptoJS = require('crypto-js')
const ApiFactory = require('../lib/shopify.api.factory')
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
module.exports = async function (context, input) {
  // strategy is not supported
  if (!['basic', 'web', 'facebook', 'twitter'].includes(input.strategy)) {
    throw new InvalidCallError(`Invalid call: Authentication strategy: '${input.strategy}' not supported`)
  }

  // TODO move to some kind of token manager class or function (SHOPIFY-563)
  let storefrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  if (!storefrontAccessToken) {
    const adminApi = ApiFactory.buildAdminApi(context)
    storefrontAccessToken = (await adminApi.getStoreFrontAccessToken()).access_token
    context.storage.extension.set('storefrontAccessToken', storefrontAccessToken)
  }

  const storefrontApi = ApiFactory.buildStorefrontApi(context, storefrontAccessToken)

  let customerAccessToken
  switch (input.strategy) {
    case 'basic':
      customerAccessToken = await storefrontApi.getCustomerAccessToken(input.parameters.login, input.parameters.password)
      break
    case 'web':
      const phrase = await context.storage.device.get('webLoginPhrase')

      /** @type {Buffer} */
      const decryptedData = CryptoJS.AES.decrypt(input.parameters.payload, phrase)
      const decodedPayload = decryptedData.toString(CryptoJS.enc.Utf8)

      /** @type {{u: string, p: string}} */
      const userData = JSON.parse(decodedPayload)
      customerAccessToken = await storefrontApi.getCustomerAccessToken(userData.u, userData.p)
      break
  }

  return {
    customerAccessToken,
    storefrontAccessToken,
    customerId: input.parameters.customerId
  }
}
