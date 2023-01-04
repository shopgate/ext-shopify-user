const ApiFactory = require('../lib/shopify.api.factory')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const ShopgateCustomer = require('../models/user/ShopgateCustomer')

/**
 * @param {SDKContext} context
 * @return {ShopgateCustomer}
 */
module.exports = async function (context) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (!context.meta.userId) {
    throw new UnauthorizedError('Unauthorized user')
  }

  // Look user storage first
  const userData = await context.storage.user.get('userData')
  if (userData && userData.ttl && userData.ttl > Date.now()) {
    return userData.user
  }

  let customerData = { id: null, mail: null }
  try {
    const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
    const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
    const customerAccessToken = await tokenManager.getCustomerAccessToken()

    customerData = ShopgateCustomer.fromShopifyCustomer(await storefrontApi.getCustomerByAccessToken(customerAccessToken.accessToken))
  } catch (err) {
    return customerData
  }
  await context.storage.user.set('userData', {
    ttl: (new Date()).getTime() + context.config.userDataCacheTtl, // cache for N microseconds
    user: customerData
  })

  return customerData
}
