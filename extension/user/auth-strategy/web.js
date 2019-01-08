const CryptoJS = require('crypto-js')
const ApiFactory = require('../../lib/shopify.api.factory')
const CustomerNotFoundError = require('../../models/Errors/CustomerNotFoundError')
const ShopifyCustomer = require('./shared/ShopifyCustomer')
const ShopifyStorefront = require('./shared/ShopifyStorefront')
/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.strategy
 * @param {ShopifyCustomerAccessToken} input.customerAccessToken
 * @param {string} input.storefrontAccessToken
 * @param {string} input.customerId
 * @return {Promise<{userId: string}>}
 */
module.exports = async function (context, input) {
  if (input.strategy !== 'web') {
    return {}
  }

  // todo check exactly what it is about
  if (!input.parameters.customerId) {
    context.log.error('No userId given on input strategy web')
    throw new CustomerNotFoundError()
  }

  const storefrontAccessToken = await ShopifyStorefront.create(context).getAccessToken()
  const phrase = await context.storage.device.get('webLoginPhrase')

  /** @type {Buffer} */
  const decryptedData = CryptoJS.AES.decrypt(input.parameters.payload, phrase)
  const decodedPayload = decryptedData.toString(CryptoJS.enc.Utf8)

  /** @type {{u: string, p: string}} */
  const userData = JSON.parse(decodedPayload)
  const shopifyCustomer = new ShopifyCustomer(ApiFactory.buildStorefrontApi(context, storefrontAccessToken))
  const customerAccessToken = await shopifyCustomer.getAccessToken(userData.u, userData.p)

  return {
    userId: await shopifyCustomer.getIdByToken(customerAccessToken),
    customerAccessToken
  }
}
