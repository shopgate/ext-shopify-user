const ShopifyApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @returns {Promise<{ logoutUrl: string }>}
 */
module.exports = async (context) => {
  const tokenManager = ShopifyApiFactory.buildShopifyApiTokenManager(context)
  const headlessAuthApi = ShopifyApiFactory.buildHeadlessAuthApi(context)

  const idToken = await tokenManager.getHeadlessAuthApiIdToken()

  return { logoutUrl: headlessAuthApi.buildCustomerLogoutUrl(idToken) }
}
