const ApiFactory = require('../lib/ShopifyApiFactory')
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

  const customerAccountApiAccessToken = await context.storage.user.get('customerAccountApiAccessToken')
  const customerData = customerAccountApiAccessToken
    ? await _getCustomerFromCustomerAccountApi(context, customerAccountApiAccessToken)
    : await _getCustomerFromStorefrontApi(context)

  if (!customerData) return { id: null, mail: null }

  await context.storage.user.set('userData', {
    ttl: (new Date()).getTime() + context.config.userDataCacheTtl, // cache for N microseconds
    user: customerData
  })

  return customerData
}

async function _getCustomerFromStorefrontApi (context) {
  try {
    const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
    const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
    const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

    return ShopgateCustomer.fromShopifyCustomer(await storefrontApi.getCustomerByAccessToken(customerAccessToken.accessToken))
  } catch (err) {
    context.log.error({ message: err.message }, 'Error getting customer data from Storefront API.')
  }
}

async function _getCustomerFromCustomerAccountApi (context, customerAccountApiAccessToken) {
  try {
    const customerAccountApi = ApiFactory.buildCustomerAccountApi(context)
    const customerDataResult = await customerAccountApi.getCustomer(customerAccountApiAccessToken.accessToken)

    const customerData = ((customerDataResult || {}).data || {}).customer
    if (!customerData) {
      context.log.error({ customerDataResult: JSON.stringify(customerDataResult) }, 'Error getting customer data from Customer Account API.')
      return
    }

    return new ShopgateCustomer(
      customerData.id.substring(23),
      (customerData.emailAddress || {}).emailAddress,
      customerData.firstName,
      customerData.lastName,
      {
        phone: customerData.phoneNumber
      },
    )
  } catch (err) {
    context.log.error({ message: err.message, code: err.code, statusCode: err.statusCode }, 'Error getting customer data from Customer Account API.')
  }
}
