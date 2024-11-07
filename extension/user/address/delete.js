const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const InvalidCallError = require('../../models/Errors/InvalidCallError')
const ApiFactory = require('../../lib/ShopifyApiFactory')

/**
 * @typedef {Object} input
 * @property {string[]} ids
 *
 * @param {SDKContext} context
 * @param input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('User is not logged in.')
  }

  const { ids } = input

  if (!Array.isArray(ids) || ids.length === 0 || ids.includes('')) {
    throw new InvalidCallError()
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
  const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

  await Promise.all(ids.map(id => {
    return storefrontApi.customerAddressDelete(customerAccessToken.accessToken, id)
  }))
}
