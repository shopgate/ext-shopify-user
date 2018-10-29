const ApiFactory = require('../lib/shopify.api.factory')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')

/**
 * @param {SDKContext} context
 * @param {UpdateMailInput} input
 * @return {Promise<ShopifyCustomer>}
 */
module.exports = async function (context, input) {
  if (!context.meta.userId) {
    throw new UnauthorizedError('Unauthorized user')
  }

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessTokenManager = ApiFactory.buildCustomerTokenManager(context)
  const customerAccessToken = await customerAccessTokenManager.getToken()

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, { email: input.mail })
}