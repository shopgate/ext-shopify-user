const ApiFactory = require('../lib/shopify.api.factory')
const CustomerTokenManager = require('../lib/CustomerTokenManager')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const ShopgateCustomer = require('../models/user/ShopgateCustomer')
const _ = {
  isNil: require('lodash/isNil'),
  omitBy: require('lodash/omitBy')
}

/**
 * @param {SDKContext} context
 * @param {UpdateUserInput} input
 * @return {Promise<ShopifyCustomer>}
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
  const customerAccessTokenManager = new CustomerTokenManager(context)
  const customerAccessToken = await customerAccessTokenManager.getToken()
  const customer = {
    firstName: input.firstName,
    lastName: input.lastName,
    ...input.customAttributes
  }

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, _.omitBy(customer, _.isNil))
}
