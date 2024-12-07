const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const ApiFactory = require('../../lib/ShopifyApiFactory')

/**
 * @typedef {Object} input
 * @property {string[]} tags - address tag list, e.g if the address is 'default'
 * @property {string} id - id of Shopify address to update
 *
 * @param {SDKContext} context
 * @param input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('User is not logged in.')
  }

  if (input.tags && input.tags.includes('default')) {
    const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
    const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
    const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

    return storefrontApi.customerDefaultAddressUpdate(customerAccessToken.accessToken, input.id)
  }
}
