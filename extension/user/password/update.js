const ApiFactory = require('../../lib/shopify.api.factory')
const UnauthorizedError = require('../../models/Errors/UnauthorizedError')

/**
 * @typedef {Object} UpdatePasswordInput
 * @property {string} password - new password
 * @property {string} oldPassword - old password for verification
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

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessTokenManager = ApiFactory.buildCustomerTokenManager(context)
  const customerAccessToken = await customerAccessTokenManager.getToken()
  const options = { password: input.password /*, oldPassword: input.oldPassword*/ }

  return storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, options)
}
