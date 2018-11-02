const ApiFactory = require('../../lib/shopify.api.factory')
const InvalidCallError = require('../../models/Errors/InvalidCallError')
const UnauthorizedError = require('../../models/Errors/UnauthorizedError')

/**
 * @typedef {Object} UpdatePasswordInput
 * @property {string} password - new password
 * @property {string} token - current Bearer token
 * @property {string} userId - current customer ID
 */
/**
 * @param {SDKContext} context
 * @param {UpdatePasswordInput} input
 * @return {Promise<ShopifyCustomerUpdateResponse>}
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    throw new UnauthorizedError()
  }

  if (!input.password) {
    throw new InvalidCallError()
  }

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessTokenManager = ApiFactory.buildCustomerTokenManager(context)
  const customerAccessToken = await customerAccessTokenManager.getToken()
  const options = { password: input.password }

  const result = await storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, options)
  await customerAccessTokenManager.setToken(result.customerAccessToken)

  return result
}
