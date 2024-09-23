const ShopifyApiFactory = require("../../lib/ShopifyApiFactory");

module.exports = async (context, input) => {
  const tokenManager = ShopifyApiFactory.buildShopifyApiTokenManager(context)

  let storefrontApiCustomerAccessToken
  try {
    storefrontApiCustomerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()
  } catch (err) {
    const customerAccountApiAccessToken = await tokenManager.getCustomerAccountApiAccessToken()

    // if there's no Customer Account API access token the shop either does not use "new customer accounts" or all means
    // getting a new token failed, i.e. the user is not logged in anymore
    if (!customerAccountApiAccessToken) {
      throw err
    }

    const customerAccountApi = ShopifyApiFactory.buildCustomerAccountApi(context)
    storefrontApiCustomerAccessToken = await customerAccountApi.getStorefrontApiCustomerAccessToken(customerAccountApiAccessToken)
  }

  return { storefrontApiCustomerAccessToken }
}
