const ApiFactory = require('../lib/shopify.api.factory')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.strategy
 * @param {ShopifyCustomerAccessToken} input.customerAccessToken
 * @param {string} input.customerId
 * @return {Promise<{userId: string}>}
 */
module.exports = async (context, input) => {
  if (input.strategy === 'web') {
    if (!input.customerId) {
      context.log.error('No userId given on input strategy web')
      throw new CustomerNotFoundError()
    } else {
      return { userId: input.customerId.toString() }
    }
  }

  const storefrontApi = ApiFactory.buildStorefrontApi(context)
  const userId = (await storefrontApi.getCustomerByAccessToken(input.customerAccessToken.accessToken))
    .id.substring(23) // strip 'gid://shopify/Customer/'

  return { userId }
}
