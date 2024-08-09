const uuid = require('uuid').v4
const ShopifyApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @returns {Promise<{ redirectUri: string }>}
 */
module.exports = async (context) => {
  const headlessAuthApi = ShopifyApiFactory.buildHeadlessAuthApi(context)

  const state = uuid()
  const nonce = uuid()
  context.storage.device.set('loginState', state)
  context.storage.device.set('loginNonce', nonce)

  return {
    loginUrl: headlessAuthApi.buildCustomerAuthorizationRedirectUrl(state, nonce, context.config.shopifyHeadlessApiLoginRedirectUrl)
  }
}
