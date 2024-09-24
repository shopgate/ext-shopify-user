const CryptoJS = require('crypto-js')
const ApiFactory = require('../lib/ShopifyApiFactory')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')

let lastUsedNonce

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.strategy
 * @param {Object} input.parameters
 * @param {string} input.parameters.login The customer's login (i.e. email address) when using strategy "basic".
 * @param {string} input.parameters.password The customer's password when using strategy "basic".
 * @param {string} input.parameters.customerId The customer's ID sent by app when using strategy "web".
 * @param {string} input.parameters.payload Encrypted login data sent by app when using strategy "web".
 * @param {string} input.parameters.code The auth code provided by Shopify after successful log in (shopifyHeadlessLogin).
 * @returns {Promise<{storefrontApiCustomerAccessToken: StorefrontApiCustomerAccessToken, customerAccountsApiAccessToken?: CustomerAccountApiAccessToken, customerId?: string}>}
 */
module.exports = async (context, input) => {
  if (!['basic', 'web', 'facebook', 'twitter', 'shopifyHeadlessLogin', 'shopifyNewCustomerAccounts'].includes(input.strategy)) {
    throw new InvalidCallError(`Invalid call: Authentication strategy: '${input.strategy}' not supported`)
  }

  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  let storefrontApiCustomerAccessToken
  let headlessAuthApiAccessToken
  let customerAccountApiAccessToken
  switch (input.strategy) {
    case 'basic':
      storefrontApiCustomerAccessToken = await storefrontApi.getCustomerAccessToken(input.parameters.login, input.parameters.password)
      break

    case 'shopifyHeadlessLogin': {
      const logObject = { ...input.parameters, code: 'xxxxx' }

      if (!input.parameters.code) {
        context.log.error(logObject, 'Shopify Headless Login did not receive auth code')
        throw new UnauthorizedError()
      }

      const headlessAuthApi = ApiFactory.buildHeadlessAuthApi(context)

      // get access token using the incoming auth code
      try {
        headlessAuthApiAccessToken = await headlessAuthApi.getAccessTokenByAuthCode(input.parameters.code, await context.storage.device.get('loginNonce'))
      } catch (err) {
        context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error fetching login access token')
        throw new UnauthorizedError('access token')
      }

      // exchange access token for a personalized customer account API access token
      try {
        customerAccountApiAccessToken = await headlessAuthApi.exchangeAccessToken(headlessAuthApiAccessToken.accessToken)
      } catch (err) {
        context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error exchanging login access token for Customer Account API access token')
        throw new UnauthorizedError('exchange')
      }

      // get the Storefront API customer access token via the Customer Accounts API
      const customerAccountsApi = ApiFactory.buildCustomerAccountApi(context)
      try {
        const customerAccessTokenResponse = await customerAccountsApi.getStorefrontApiCustomerAccessToken(customerAccountApiAccessToken.accessToken)
        storefrontApiCustomerAccessToken = { accessToken: customerAccessTokenResponse.data.storefrontCustomerAccessTokenCreate.customerAccessToken }
      } catch (err) {
        context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error fetching Storefront API customer access token using Customer Account API')
        throw new UnauthorizedError('storefront access token')
      }
      break
    }

    case 'web': {
      const phrase = await context.storage.device.get('webLoginPhrase')

      /** @type {Buffer} */
      const decryptedData = CryptoJS.AES.decrypt(input.parameters.payload, phrase)
      const decodedPayload = decryptedData.toString(CryptoJS.enc.Utf8)

      /** @type {{u: string, p: string}} */
      const userData = JSON.parse(decodedPayload)
      storefrontApiCustomerAccessToken = await storefrontApi.getCustomerAccessToken(userData.u, userData.p)
      break
    }
  }

  return {
    storefrontApiCustomerAccessToken,
    headlessAuthApiAccessToken,
    customerAccountApiAccessToken,
    customerId: input.parameters.customerId
  }
}
