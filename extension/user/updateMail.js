const ApiFactory = require('../lib/ShopifyApiFactory')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')

/**
 * @param {SDKContext} context
 * @param {{ mail: string, sgxsMeta: SgxsMeta }} input
 * @return {Promise<ShopifyStorefrontApiCustomerUpdateResponse>}
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('Unauthorized user')
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

  const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta)

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, { email: input.mail })
}
