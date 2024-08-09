const ApiFactory = require('../lib/ShopifyApiFactory')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const _ = {
  isNil: require('lodash/isNil'),
  omitBy: require('lodash/omitBy')
}

/**
 * @param {SDKContext} context
 * @param {ShopgateUser} input
 * @return {Promise<ShopifyCustomerUpdateResponse>}
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
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
  const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
  const customerAccessToken = await tokenManager.getCustomerAccessToken()

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, _.omitBy(customer, _.isNil))
}
