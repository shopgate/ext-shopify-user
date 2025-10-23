const ShopifyApiFactory = require('../../lib/ShopifyApiFactory')

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
    context.log.warn('Error getting Storefront API customer access token, falling back to Customer Account API if applicable')

    // try falling back to the Shopify Customer Account API
    let customerAccountApiAccessToken
    try {
      customerAccountApiAccessToken = await tokenManager.getCustomerAccountApiAccessToken()
    } catch (err) {
      context.log.warn('Error getting a Customer Account API access token, returning void')
      return
    }

    // if there's no Customer Account API access token the shop either does not use "new customer accounts" or all means
    // getting a new token failed, i.e. the user is not logged in anymore
    if (!customerAccountApiAccessToken) {
      context.log.debug('No Customer Account API access token found, returning void')
      return
    }

    try {
      const customerAccountApi = ShopifyApiFactory.buildCustomerAccountApi(context)
      storefrontApiCustomerAccessToken = await customerAccountApi.getStorefrontApiCustomerAccessToken(customerAccountApiAccessToken.accessToken)
      await tokenManager.setStorefrontApiCustomerAccessToken(storefrontApiCustomerAccessToken)
    } catch (err) {
      context.log.error(
        { errorMessage: err.message, statusCode: err.statusCode, code: err.code },
        'Error getting a Storefront API customer access token from the Customer Account API, returning void'
      )

      return
    }
  }

  return { storefrontApiCustomerAccessToken }
}
