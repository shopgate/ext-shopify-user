const ShopifyApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @returns {Promise<{ logoutUrl: string }>}
 */
module.exports = async (context) => {
  const tokenManager = ShopifyApiFactory.buildShopifyApiTokenManager(context)
  const headlessAuthApi = ShopifyApiFactory.buildHeadlessAuthApi(context)

  let idToken
  try {
    idToken = await tokenManager.getHeadlessAuthApiIdToken()
  } catch (err) {
    context.log.warn('User trying to log out but apparently not logged in? Generating logout URL without idToken.')
  }

  return { logoutUrl: headlessAuthApi.buildCustomerLogoutUrl(idToken) }
}
