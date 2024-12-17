const ApiFactory = require('../lib/ShopifyApiFactory')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const ShopgateCustomer = require('../models/user/ShopgateCustomer')

/**
 * @param {SDKContext} context
 * @param {{ sgxsMeta: SgxsMeta }} input
 * @return {ShopgateCustomer}
 */
module.exports = async function (context, { sgxsMeta }) {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('Unauthorized user')
  }

  // Look user storage first
  const userData = await context.storage.user.get('userData')
  if (userData && userData.ttl && userData.ttl > Date.now()) {
    return userData.user
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)

  let customerData
  try {
    const customerAccountApiAccessToken = await tokenManager.getCustomerAccountApiAccessToken()
    customerData = customerAccountApiAccessToken
      ? await _getCustomerFromCustomerAccountApi(context, customerAccountApiAccessToken)
      : await _getCustomerFromStorefrontApi(context, sgxsMeta, tokenManager)
  } catch (err) {
    context.log.error({ errorMessage: err.message, code: err.code, statusCode: err.statusCode }, 'Error getting customer data')
    throw err
  }

  if (!customerData) return { id: null, mail: null }

  await context.storage.user.set('userData', {
    ttl: (new Date()).getTime() + context.config.userDataCacheTtl,
    user: customerData
  })

  return customerData
}

async function _getCustomerFromStorefrontApi (context, sgxsMeta, tokenManager) {
  try {
    const storefrontApi = ApiFactory.buildStorefrontApi(context, sgxsMeta, tokenManager)
    const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

    return ShopgateCustomer.fromShopifyStorefrontApiCustomer(await storefrontApi.getCustomerByAccessToken(customerAccessToken.accessToken))
  } catch (err) {
    context.log.error({ errorMessage: err.message }, 'Error getting customer data from Storefront API.')
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

    return ShopgateCustomer.fromShopifyCustomerAccountApiCustomer(customerData)
  } catch (err) {
    context.log.error({ errorMessage: err.message, code: err.code, statusCode: err.statusCode }, 'Error getting customer data from Customer Account API.')
  }
}
