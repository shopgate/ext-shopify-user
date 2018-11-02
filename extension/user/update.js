const ApiFactory = require('../lib/shopify.api.factory')
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
module.exports = async function (context, input) {
  if (!context.meta.userId) {
    throw new UnauthorizedError('Unauthorized user')
  }

  if (_.isNil(input.firstName) && _.isNil(input.lastName) && _.isNil(input.customAttributes)) {
    throw new InvalidCallError()
  }

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessTokenManager = ApiFactory.buildCustomerTokenManager(context)
  const customerAccessToken = await customerAccessTokenManager.getToken()
  const customer = {
    firstName: input.firstName,
    lastName: input.lastName,
    ...input.customAttributes
  }

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, _.omitBy(customer, _.isNil))
}
