const ShopifyApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @returns {Promise<{ logoutUrl: string }>}
 */
module.exports = async (context) => {
  const tokenManager = ShopifyApiFactory.buildShopifyApiTokenManager(context)
  const headlessAuthApi = ShopifyApiFactory.buildHeadlessAuthApi(context)

  const idToken = await tokenManager.getHeadlessAuthApiIdToken()

  console.log(headlessAuthApi.buildCustomerLogoutUrl(idToken), '##############################################')

  return { logoutUrl: headlessAuthApi.buildCustomerLogoutUrl(idToken) }
}
