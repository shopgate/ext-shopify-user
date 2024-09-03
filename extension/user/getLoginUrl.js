const uuid = require('uuid').v4
const ShopifyApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @returns {Promise<{ loginUrl: string }>}
 */
module.exports = async (context) => {
  const headlessAuthApi = ShopifyApiFactory.buildHeadlessAuthApi(context)

  const nonce = uuid()
  await context.storage.device.set('loginNonce', nonce)

  return { loginUrl: headlessAuthApi.buildCustomerAuthorizationRedirectUrl(nonce) }
}
