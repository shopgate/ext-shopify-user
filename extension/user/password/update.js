const ApiFactory = require('../../lib/ShopifyApiFactory')
const FieldValidationError = require('../../models/Errors/FieldValidationError')
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
    context.log.debug('No user ID set in meta data')
    throw new UnauthorizedError()
  }

  if (!input.password) {
    const validationError = new FieldValidationError()
    validationError.addStorefrontValidationMessage('password', 'user.errors.blank')
    throw validationError
  }

  const tokenManager = ApiFactory.buildShopifyApiTokenManager(context)
  const storefrontApi = ApiFactory.buildStorefrontApi(context, tokenManager)
  const customerAccessToken = await tokenManager.getStorefrontApiCustomerAccessToken()

  const options = { password: input.password }

  const result = await storefrontApi.updateCustomerByAccessToken(customerAccessToken.accessToken, options)
  await tokenManager.setStorefrontApiCustomerAccessToken(result.customerAccessToken)

  return result
}
