const ApiFactory = require('../lib/ShopifyApiFactory')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')

/**
 * @param {SDKContext} context
 * @param {UpdateMailInput} input
 * @return {Promise<ShopifyCustomerUpdateResponse>}
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    throw new UnauthorizedError('Unauthorized user')
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
  const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, { email: input.mail })
}
