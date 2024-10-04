const ShopifyApiFactory = require("../../lib/ShopifyApiFactory");

/**
 * @param {SDKContext} context
 * @returns {Promise<{storefrontApiCustomerAccessToken?: StorefrontApiCustomerAccessToken}|void>}
 */
module.exports = async (context) => {
  const tokenManager = ShopifyApiFactory.buildShopifyApiTokenManager(context)

  let storefrontApiCustomerAccessToken
  try {
    storefrontApiCustomerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()
  } catch (err) {
    // try falling back to the Shopify Customer Account API
    let customerAccountApiAccessToken
    try {
      customerAccountApiAccessToken = await tokenManager.getCustomerAccountApiAccessToken()
    } catch (err) {
      return
    }

    // if there's no Customer Account API access token the shop either does not use "new customer accounts" or all means
    // getting a new token failed, i.e. the user is not logged in anymore
    if (!customerAccountApiAccessToken) {
      return
    }

    try {
      const customerAccountApi = ShopifyApiFactory.buildCustomerAccountApi(context)
      storefrontApiCustomerAccessToken = await customerAccountApi.getStorefrontApiCustomerAccessToken(customerAccountApiAccessToken.accessToken)
      await tokenManager.setStorefrontApiCustomerAccessToken(storefrontApiCustomerAccessToken)
    } catch (err) {
      return
    }
  }

  return { storefrontApiCustomerAccessToken }
}
