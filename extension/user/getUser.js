const Tools = require('../lib/tools')
const ApiFactory = require('../lib/shopify.api.factory')
const CustomerTokenManager = require('../lib/CustomerTokenManager')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const ShopgateCustomer = require('../models/user/ShopgateCustomer')

/**
 * @param {SDKContext} context
 * @return {Promise<ShopgateCustomer>}
 */
module.exports = async function (context) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('Unauthorized user')
  }

  // Look user storage first
  const userData = await context.storage.user.get('userData')
  if (userData && userData.ttl && userData.ttl > Date.now()) {
    return userData.user
  }

  const customerAccessTokenManager = new CustomerTokenManager(context)
  const customerAccessToken = await customerAccessTokenManager.getToken()
  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerData = ShopgateCustomer.fromShopifyCustomer(await storefrontApi.getCustomerByAccessToken(customerAccessToken.accessToken))
  await context.storage.user.set('userData', {
    ttl: (new Date()).getTime() + context.config.userDataCacheTtl, // cache for N microseconds
    user: customerData
  })

  return customerData
}
