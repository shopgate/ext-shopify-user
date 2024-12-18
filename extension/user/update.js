const ApiFactory = require('../lib/ShopifyApiFactory')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const _ = {
  isNil: require('lodash/isNil'),
  omitBy: require('lodash/omitBy')
}

/**
 * @param {SDKContext} context
 * @param {ShopgateUser & { sgxsMeta: SgxsMeta }} input
 * @return {Promise<ShopifyStorefrontApiCustomerUpdateResponse>}
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError('Unauthorized user')
  }

  if (_.isNil(input.firstName) && _.isNil(input.lastName) && _.isNil(input.customAttributes)) {
    throw new InvalidCallError()
  }

  const customer = {
    firstName: input.firstName,
    lastName: input.lastName,
    ...input.customAttributes
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta, tokenManager)
  const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, _.omitBy(customer, _.isNil))
}
