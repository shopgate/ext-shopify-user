const Tools = require('../lib/tools')
const ApiFactory = require('../lib/shopify.api.factory')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('Unauthorized user')
  }

  // Look user storage first
  const userData = await context.storage.user.get('userData')
  if (userData) {
    // check TTL for data if still valid
    if (userData.ttl > (new Date()).getTime()) {
      return userData.user
    }
  }

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  let customerAccessToken = await context.storage.user.get('customerAccessToken')
  if (!customerAccessToken || !customerAccessToken.accessToken) {
    throw new UnauthorizedError('Please log in again.')
  }

  const shopifyCustomerData = await storefrontApi.getCustomerByAccessToken(customerAccessToken.accessToken)
  shopifyCustomerData.id = Buffer.from(shopifyCustomerData.id, 'base64').toString().substring(23)
  shopifyCustomerData.mail = shopifyCustomerData.email
  delete shopifyCustomerData.email

  await context.storage.user.set('userData', {
    ttl: (new Date()).getTime() + context.config.userDataCacheTtl, // cache for N microseconds
    user: shopifyCustomerData
  })

  return shopifyCustomerData
}
