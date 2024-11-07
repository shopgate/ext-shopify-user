const ShopifyApiFactory = require('../../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {StorefrontApiCustomerAccessToken} input.storefrontApiCustomerAccessToken
 * @param {HeadlessAuthApiAccessToken?} input.headlessAuthApiAccessToken
 * @param {CustomerAccountApiAccessToken?} input.customerAccountApiAccessToken
 * @param {string} input.userId
 * @returns {Promise<void>}
 * @throws Error when saving the customer access token fails.
 */
module.exports = async (context, input) => {
  const tokenManager = ShopifyApiFactory.buildShopifyApiTokenManager(context)

  await tokenManager.setStorefrontApiCustomerAccessToken(input.storefrontApiCustomerAccessToken)

  if (input.headlessAuthApiAccessToken) {
    await Promise.all([
      tokenManager.setHeadlessAuthApiAccessToken(input.headlessAuthApiAccessToken),
      tokenManager.setCustomerAccountApiAccessToken(input.customerAccountApiAccessToken)
    ])
  }
}
