const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const ApiFactory = require('../../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {{ id: string, tags: string[], sgxsMeta: SgxsMeta }} input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('User is not logged in.')
  }

  if (input.tags && input.tags.includes('default')) {
    const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
    const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta, tokenManager)
    const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

    return storefrontApi.customerDefaultAddressUpdate(customerAccessToken.accessToken, input.id)
  }
}
