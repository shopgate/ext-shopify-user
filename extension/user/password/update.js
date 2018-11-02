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
 * @param {StepContext} context
 * @param {UpdatePasswordInput} input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    throw new UnauthorizedError('Unauthorized user')
  }

  if (!input.password) {
    throw new InvalidCallError()
  }

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessTokenManager = ApiFactory.buildCustomerTokenManager(context)
  const customerAccessToken = await customerAccessTokenManager.getToken()
  const options = { password: input.password }

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, options)
}
