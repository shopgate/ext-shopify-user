const ShopifyApiFactory = require('../../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @returns {Promise<void>}
 * @throws Error when saving the customer access token fails.
 */
module.exports = async (context, input) => {
  const tokenManager = ShopifyApiFactory.buildShopifyApiTokenManager(context)

  await Promise.all([
    tokenManager.deleteStorefrontApiCustomerAccessToken(),
    tokenManager.deleteHeadlessAuthApiAccessToken(),
    tokenManager.deleteCustomerAccountApiAccessToken()
  ])
}
